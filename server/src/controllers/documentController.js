import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma.js';
import { UPLOADS_DIR } from '../lib/storage.js';

/** GET /api/documents - Get all documents for authenticated user */
export async function getDocuments(req, res) {
  try {
    const { search, category, sort = 'desc' } = req.query;

    const where = { userId: req.user.id };
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { fileName: { contains: search } },
        { category: { contains: search } }
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' }
    });

    res.json({ success: true, data: documents });
  } catch (err) {
    console.error('getDocuments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
  }
}

/** GET /api/documents/:id - Get single document metadata */
export async function getDocument(req, res) {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('getDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch document.' });
  }
}

/** POST /api/documents - Upload & create new document */
export async function createDocument(req, res) {
  try {
    const { title, description, category, categoryId, fileUrl } = req.body;

    let finalFileName = 'document';
    let finalFileType = 'application/octet-stream';
    let finalFileSize = 0;
    let finalFileUrl = fileUrl || '';

    // If file uploaded via Multer
    if (req.file) {
      finalFileName = req.file.originalname;
      finalFileType = req.file.mimetype || path.extname(req.file.originalname).slice(1) || 'file';
      finalFileSize = req.file.size;
      finalFileUrl = `/api/documents/file/${req.file.filename}`;
    } else if (req.body.fileName) {
      finalFileName = req.body.fileName;
      finalFileType = req.body.fileType || 'file';
      finalFileSize = Number(req.body.fileSize) || 1024;
      finalFileUrl = req.body.fileUrl || `https://example.com/${finalFileName}`;
    }

    const docTitle = title?.trim() || finalFileName;

    const doc = await prisma.document.create({
      data: {
        userId: req.user.id,
        title: docTitle,
        description: description?.trim() || null,
        category: category || 'Other',
        categoryId: categoryId || null,
        fileName: finalFileName,
        fileType: finalFileType,
        fileSize: finalFileSize,
        fileUrl: finalFileUrl
      }
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('createDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to save document.' });
  }
}

/** GET /api/documents/:id/download - Secure file download */
export async function downloadDocument(req, res) {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    // Check if stored locally in uploads
    if (doc.fileUrl.startsWith('/api/documents/file/')) {
      const storedFileName = doc.fileUrl.replace('/api/documents/file/', '');
      const filePath = path.join(UPLOADS_DIR, storedFileName);

      if (fs.existsSync(filePath)) {
        return res.download(filePath, doc.fileName);
      }
    }

    // Otherwise redirect to cloud fileUrl or send URL
    res.redirect(doc.fileUrl);
  } catch (err) {
    console.error('downloadDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to download document.' });
  }
}

/** GET /api/documents/file/:filename - Secure file preview stream */
export async function serveDocumentFile(req, res) {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOADS_DIR, filename);

    // Verify user owns the document with this fileUrl
    const expectedUrl = `/api/documents/file/${filename}`;
    const doc = await prisma.document.findFirst({
      where: { fileUrl: expectedUrl, userId: req.user.id }
    });

    if (!doc) {
      return res.status(403).json({ success: false, message: 'Access denied to this document file.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on storage.' });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error('serveDocumentFile error:', err);
    res.status(500).json({ success: false, message: 'Failed to load file.' });
  }
}

/** DELETE /api/documents/:id - Delete document */
export async function deleteDocument(req, res) {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    // Clean up local file if present
    if (doc.fileUrl.startsWith('/api/documents/file/')) {
      const storedFileName = doc.fileUrl.replace('/api/documents/file/', '');
      const filePath = path.join(UPLOADS_DIR, storedFileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete physical file:', e.message);
        }
      }
    }

    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    console.error('deleteDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
}
