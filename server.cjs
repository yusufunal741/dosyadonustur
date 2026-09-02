const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const { execFile, spawn } = require("child_process");
const { ZipArchive } = require("archiver");
const fs = require("fs");
const path = require("path");
const os = require("os");

async function validateFile(buffer, extension) {
  try {
    extension = extension.toLowerCase();

    // ========================================
    // JPG / JPEG / PNG / HEIC / HEIF
    // Gerçek görüntü olarak açılabiliyor mu?
    // ========================================

    if (
      ["jpg", "jpeg", "png", "heic", "heif"].includes(
        extension
      )
    ) {
      const metadata = await sharp(buffer).metadata();

      if (!metadata.format) {
        return false;
      }

      // Uzantı ile gerçek format uyuşuyor mu?
      if (
        ["jpg", "jpeg"].includes(extension) &&
        !["jpeg", "jpg"].includes(metadata.format)
      ) {
        return false;
      }

      if (
        extension === "png" &&
        metadata.format !== "png"
      ) {
        return false;
      }

      if (
        ["heic", "heif"].includes(extension) &&
        !["heic", "heif"].includes(metadata.format)
      ) {
        return false;
      }

      return true;
    }

    // ========================================
    // PDF
    // Gerçekten açılabilir bir PDF mi?
    // ========================================

    if (extension === "pdf") {
      if (buffer.length < 5) {
        return false;
      }

      const header = buffer
        .subarray(0, 5)
        .toString("ascii");

      if (header !== "%PDF-") {
        return false;
      }

      // PDF'nin son kısmında EOF işareti bulunuyor mu?
      const tailSize = Math.min(
        buffer.length,
        1024
      );

      const tail = buffer
        .subarray(buffer.length - tailSize)
        .toString("latin1");

      if (!tail.includes("%%EOF")) {
        return false;
      }

      return true;
    }

    // ========================================
    // DOCX / PPTX / XLSX
    // Gerçek ZIP + Office dosyası mı?
    // ========================================

    if (
      ["docx", "pptx", "xlsx"].includes(extension)
    ) {
      if (buffer.length < 4) {
        return false;
      }

      // ZIP başlangıç imzası
      const header = buffer
        .subarray(0, 4)
        .toString("hex");

      if (header !== "504b0304") {
        return false;
      }

      // Office dosyalarının temel yapısını kontrol et
      const content = buffer.toString(
        "latin1"
      );

      if (!content.includes("[Content_Types].xml")) {
        return false;
      }

      if (!content.includes("_rels/.rels")) {
        return false;
      }

      // Dosya türüne özel klasör kontrolü
      if (
        extension === "docx" &&
        !content.includes("word/")
      ) {
        return false;
      }

      if (
        extension === "pptx" &&
        !content.includes("ppt/")
      ) {
        return false;
      }

      if (
        extension === "xlsx" &&
        !content.includes("xl/")
      ) {
        return false;
      }

      return true;
    }

    // Desteklenmeyen uzantı
    return false;

  } catch (error) {
    console.error(
      "DOSYA DOĞRULAMA HATASI:",
      error
    );

    return false;
  }
}
async function checkUploadedFile(req, res) {
  if (!req.file) {
    res.status(400).json({
      error: "Dosya seçilmedi.",
    });
    return false;
  }

  const extension = path
    .extname(req.file.originalname)
    .toLowerCase()
    .replace(".", "");

  const valid = await validateFile(
    req.file.buffer,
    extension
  );

  if (!valid) {
    console.log(
      "BOZUK DOSYA REDDEDİLDİ:",
      req.file.originalname
    );

    res.status(400).json({
      error:
        "Dosya bozuk veya geçersiz. Lütfen sağlam bir dosya yükleyin.",
    });

    return false;
  }

  return true;
}
const app = express();

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// ========================================
// PYTHON AYARLARI
// ========================================

const PYTHON_PATH =
  "C:\\Users\\unaly\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";

const PYTHON_SCRIPT = path.join(
  __dirname,
  "pdf_to_docx.py"
);

// ========================================
// LIBREOFFICE AYARI
// ========================================

const SOFFICE_PATH =
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

// ========================================
// JPG -> PNG
// ========================================

app.post(
  "/convert/jpg-to-png",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      const pngBuffer = await sharp(req.file.buffer)
        .png()
        .toBuffer();

      res.set({
        "Content-Type": "image/png",
        "Content-Disposition":
          'attachment; filename="donusturulmus.png"',
      });

      res.send(pngBuffer);
    } catch (error) {
      console.error("JPG -> PNG HATASI:", error);

      res.status(500).json({
        error: "Dosya dönüştürülemedi.",
      });
    }
  }
);

// ========================================
// PNG -> JPG
// ========================================

app.post(
  "/convert/png-to-jpg",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      const jpgBuffer = await sharp(req.file.buffer)
        .jpeg()
        .toBuffer();

      res.set({
        "Content-Type": "image/jpeg",
        "Content-Disposition":
          'attachment; filename="donusturulmus.jpg"',
      });

      res.send(jpgBuffer);
    } catch (error) {
      console.error("PNG -> JPG HATASI:", error);

      res.status(500).json({
        error: "Dosya dönüştürülemedi.",
      });
    }
  }
);
// ========================================
// HEIC / HEIF -> JPG
// ========================================

app.post(
  "/convert/heic-to-jpg",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      console.log("");
      console.log("=================================");
      console.log("HEIC -> JPG dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("Boyut:", req.file.size);
      console.log("=================================");

      const outputBuffer = await sharp(req.file.buffer)
        .jpeg({
          quality: 90,
        })
        .toBuffer();

      console.log("HEIC -> JPG BAŞARILI!");
      console.log(
        "JPG boyutu:",
        outputBuffer.length,
        "byte"
      );

      res.setHeader(
        "Content-Type",
        "image/jpeg"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="donusturulmus.jpg"'
      );

      res.setHeader(
        "Content-Length",
        outputBuffer.length
      );

      res.end(outputBuffer);
    } catch (error) {
      console.error(
        "HEIC -> JPG HATASI:",
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "HEIC dosyası JPG'ye dönüştürülemedi.",
        });
      }
    }
  }
);
// ========================================
// IMAGE -> PDF
// ========================================

app.post(
  "/convert/image-to-pdf",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      const imageBuffer = await sharp(req.file.buffer)
        .jpeg()
        .toBuffer();

      const metadata = await sharp(imageBuffer).metadata();

      const doc = new PDFDocument({
        size: [metadata.width, metadata.height],
        margin: 0,
      });

      const chunks = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);

        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="donusturulmus.pdf"',
        });

        res.send(pdfBuffer);
      });

      doc.image(imageBuffer, 0, 0, {
        width: metadata.width,
        height: metadata.height,
      });

      doc.end();
    } catch (error) {
      console.error("IMAGE -> PDF HATASI:", error);

      res.status(500).json({
        error: "PDF oluşturulamadı.",
      });
    }
  }
);

// ========================================
// PDF -> JPG
// TÜM SAYFALAR -> ZIP
// ========================================

app.post(
  "/convert/pdf-to-jpg",
  upload.single("file"),
  async (req, res) => {
    let tempDir = null;

    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      console.log("");
      console.log("=================================");
      console.log("PDF -> JPG dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("Boyut:", req.file.size);
      console.log("=================================");

      const { pdf } = await import("pdf-to-img");

      tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "dosyadonusum-")
      );

      const document = await pdf(req.file.buffer);

      let pageNumber = 0;

      const outputPath = path.join(
        tempDir,
        "donusturulmus.zip"
      );

      const output = fs.createWriteStream(
        outputPath
      );

      const archive = new ZipArchive({
  zlib: {
    level: 6,
  },
});

      const archivePromise = new Promise(
        (resolve, reject) => {
          output.on("close", resolve);
          output.on("error", reject);
          archive.on("error", reject);
        }
      );

      archive.pipe(output);

      console.log(
        "PDF sayfaları JPG olarak işleniyor..."
      );

      for await (const page of document) {
        pageNumber++;

        console.log(
          `Sayfa ${pageNumber} işleniyor...`
        );

        const jpgBuffer = await sharp(page)
          .jpeg({
            quality: 90,
          })
          .toBuffer();

        archive.append(jpgBuffer, {
          name: `sayfa-${pageNumber}.jpg`,
        });
      }

      if (pageNumber === 0) {
        archive.abort();

        throw new Error(
          "PDF içerisinde sayfa bulunamadı."
        );
      }

      await archive.finalize();

      await archivePromise;

      const zipBuffer =
        fs.readFileSync(outputPath);

      console.log(
        "PDF -> JPG BAŞARILI!"
      );

      console.log(
        "Toplam sayfa:",
        pageNumber
      );

      console.log(
        "ZIP boyutu:",
        zipBuffer.length,
        "byte"
      );

      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="donusturulmus-jpg.zip"',
        "Content-Length":
          zipBuffer.length,
      });

      res.end(zipBuffer);

      setTimeout(() => {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });

          console.log(
            "PDF -> JPG geçici dosyaları temizlendi."
          );
        } catch {}
      }, 1000);
    } catch (error) {
      console.error(
        "PDF -> JPG HATASI:",
        error
      );

      if (tempDir) {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        } catch {}
      }

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "PDF JPG'ye dönüştürülemedi.",
        });
      }
    }
  }
);

// ========================================
// PDF -> PNG
// TÜM SAYFALAR -> ZIP
// ========================================

app.post(
  "/convert/pdf-to-png",
  upload.single("file"),
  async (req, res) => {
    let tempDir = null;

    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      console.log("");
      console.log("=================================");
      console.log("PDF -> PNG dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("Boyut:", req.file.size);
      console.log("=================================");

      const { pdf } = await import("pdf-to-img");

      tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "dosyadonusum-")
      );

      const document = await pdf(req.file.buffer);

      let pageNumber = 0;

      const outputPath = path.join(
        tempDir,
        "donusturulmus.zip"
      );

      const output = fs.createWriteStream(
        outputPath
      );

     const archive = new ZipArchive({
  zlib: {
    level: 6,
  },
});

      const archivePromise = new Promise(
        (resolve, reject) => {
          output.on("close", resolve);
          output.on("error", reject);
          archive.on("error", reject);
        }
      );

      archive.pipe(output);

      console.log(
        "PDF sayfaları PNG olarak işleniyor..."
      );

      for await (const page of document) {
        pageNumber++;

        console.log(
          `Sayfa ${pageNumber} işleniyor...`
        );

        const pngBuffer = await sharp(page)
          .png()
          .toBuffer();

        archive.append(pngBuffer, {
          name: `sayfa-${pageNumber}.png`,
        });
      }

      if (pageNumber === 0) {
        archive.abort();

        throw new Error(
          "PDF içerisinde sayfa bulunamadı."
        );
      }

      await archive.finalize();

      await archivePromise;

      const zipBuffer =
        fs.readFileSync(outputPath);

      console.log(
        "PDF -> PNG BAŞARILI!"
      );

      console.log(
        "Toplam sayfa:",
        pageNumber
      );

      console.log(
        "ZIP boyutu:",
        zipBuffer.length,
        "byte"
      );

      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="donusturulmus-png.zip"',
        "Content-Length":
          zipBuffer.length,
      });

      res.end(zipBuffer);

      setTimeout(() => {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });

          console.log(
            "PDF -> PNG geçici dosyaları temizlendi."
          );
        } catch {}
      }, 1000);
    } catch (error) {
      console.error(
        "PDF -> PNG HATASI:",
        error
      );

      if (tempDir) {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        } catch {}
      }

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "PDF PNG'ye dönüştürülemedi.",
        });
      }
    }
  }
);

// ========================================
// DOCX -> PDF
// LIBREOFFICE
// ========================================

app.post(
  "/convert/docx-to-pdf",
  upload.single("file"),
  async (req, res) => {
    let tempDir = null;

    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      if (!fs.existsSync(SOFFICE_PATH)) {
        return res.status(500).json({
          error: "LibreOffice bulunamadı.",
        });
      }

      tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "dosyadonusum-")
      );

      const inputPath = path.join(
        tempDir,
        "input.docx"
      );

      const outputPath = path.join(
        tempDir,
        "input.pdf"
      );

      const profileDir = path.join(
        tempDir,
        "lo-profile"
      );

      fs.mkdirSync(profileDir, {
        recursive: true,
      });

      fs.writeFileSync(
        inputPath,
        req.file.buffer
      );

      console.log("");
      console.log("=================================");
      console.log("DOCX -> PDF dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("=================================");

      const libreOfficeArgs = [
        "--headless",
        "--nologo",
        "--nodefault",
        "--nofirststartwizard",
        "--norestore",
        "--nolockcheck",
        `-env:UserInstallation=file:///${profileDir.replace(
          /\\/g,
          "/"
        )}`,
        "--convert-to",
        "pdf",
        "--outdir",
        tempDir,
        inputPath,
      ];

      console.log(
        "LibreOffice başlatılıyor..."
      );

      const libreOfficeProcess = spawn(
        SOFFICE_PATH,
        libreOfficeArgs,
        {
          windowsHide: true,
        }
      );

      let stdout = "";
      let stderr = "";

      libreOfficeProcess.stdout.on(
        "data",
        (data) => {
          const text = data.toString();

          stdout += text;

          console.log(
            "LibreOffice:",
            text
          );
        }
      );

      libreOfficeProcess.stderr.on(
        "data",
        (data) => {
          const text = data.toString();

          stderr += text;

          console.log(
            "LibreOffice hata:",
            text
          );
        }
      );

      libreOfficeProcess.on(
        "error",
        (error) => {
          console.error(
            "LibreOffice başlatılamadı:",
            error
          );

          try {
            fs.rmSync(tempDir, {
              recursive: true,
              force: true,
            });
          } catch {}

          if (!res.headersSent) {
            res.status(500).json({
              error:
                "LibreOffice çalıştırılamadı.",
            });
          }
        }
      );

      libreOfficeProcess.on(
        "close",
        (code) => {
          console.log(
            "LibreOffice kapandı."
          );

          console.log(
            "Çıkış kodu:",
            code
          );

          console.log(
            "stdout:",
            stdout
          );

          console.log(
            "stderr:",
            stderr
          );

          if (
            code !== 0 ||
            !fs.existsSync(outputPath)
          ) {
            console.error(
              "DOCX -> PDF başarısız."
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "DOCX PDF'ye dönüştürülemedi.",
              });
            }

            return;
          }

          try {
            const pdfBuffer =
              fs.readFileSync(outputPath);

            console.log(
              "DOCX -> PDF BAŞARILI!"
            );

            console.log(
              "PDF boyutu:",
              pdfBuffer.length,
              "byte"
            );

            res.set({
              "Content-Type":
                "application/pdf",
              "Content-Disposition":
                'attachment; filename="donusturulmus.pdf"',
              "Content-Length":
                pdfBuffer.length,
            });

            res.end(pdfBuffer);

            setTimeout(() => {
              try {
                fs.rmSync(tempDir, {
                  recursive: true,
                  force: true,
                });
              } catch {}
            }, 1000);
          } catch (error) {
            console.error(
              "PDF OKUMA HATASI:",
              error
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "Oluşturulan PDF okunamadı.",
              });
            }
          }
        }
      );
    } catch (error) {
      console.error(
        "DOCX -> PDF HATASI:",
        error
      );

      if (tempDir) {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        } catch {}
      }

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "DOCX PDF'ye dönüştürülemedi.",
        });
      }
    }
  }
);

// ========================================
// PPTX -> PDF
// LIBREOFFICE
// ========================================

app.post(
  "/convert/pptx-to-pdf",
  upload.single("file"),
  async (req, res) => {
    let tempDir = null;

    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      if (!fs.existsSync(SOFFICE_PATH)) {
        return res.status(500).json({
          error: "LibreOffice bulunamadı.",
        });
      }

      tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "dosyadonusum-")
      );

      const inputPath = path.join(
        tempDir,
        "input.pptx"
      );

      const outputPath = path.join(
        tempDir,
        "input.pdf"
      );

      fs.writeFileSync(
        inputPath,
        req.file.buffer
      );

      console.log("");
      console.log("=================================");
      console.log("PPTX -> PDF dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("=================================");

      execFile(
        SOFFICE_PATH,
        [
          "--headless",
          "--convert-to",
          "pdf",
          "--outdir",
          tempDir,
          inputPath,
        ],
        {
          windowsHide: true,
          timeout: 120000,
        },
        (error, stdout, stderr) => {
          console.log(
            "PPTX -> PDF stdout:",
            stdout
          );

          console.log(
            "PPTX -> PDF stderr:",
            stderr
          );

          if (error) {
            console.error(
              "PPTX -> PDF EXEC HATASI:",
              error
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            return res.status(500).json({
              error:
                "PPTX PDF'ye dönüştürülemedi.",
            });
          }

          if (!fs.existsSync(outputPath)) {
            console.error(
              "PPTX -> PDF: PDF oluşmadı."
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            return res.status(500).json({
              error:
                "PDF dosyası oluşturulamadı.",
            });
          }

          try {
            const pdfBuffer =
              fs.readFileSync(outputPath);

            res.set({
              "Content-Type":
                "application/pdf",
              "Content-Disposition":
                'attachment; filename="donusturulmus.pdf"',
              "Content-Length":
                pdfBuffer.length,
            });

            res.end(pdfBuffer);

            console.log(
              "PPTX -> PDF BAŞARILI!"
            );

            setTimeout(() => {
              try {
                fs.rmSync(tempDir, {
                  recursive: true,
                  force: true,
                });
              } catch {}
            }, 1000);
          } catch (error) {
            console.error(
              "PPTX PDF OKUMA HATASI:",
              error
            );

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "Oluşturulan PDF okunamadı.",
              });
            }
          }
        }
      );
    } catch (error) {
      console.error(
        "PPTX -> PDF HATASI:",
        error
      );

      if (tempDir) {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        } catch {}
      }

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "PPTX PDF'ye dönüştürülemedi.",
        });
      }
    }
  }
);

// ========================================
// XLSX -> PDF
// LIBREOFFICE
// ========================================

app.post(
  "/convert/xlsx-to-pdf",
  upload.single("file"),
  async (req, res) => {
    let tempDir = null;

    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      if (!fs.existsSync(SOFFICE_PATH)) {
        return res.status(500).json({
          error: "LibreOffice bulunamadı.",
        });
      }

      tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "dosyadonusum-")
      );

      const inputPath = path.join(
        tempDir,
        "input.xlsx"
      );

      const outputPath = path.join(
        tempDir,
        "input.pdf"
      );

      fs.writeFileSync(
        inputPath,
        req.file.buffer
      );

      console.log("");
      console.log("=================================");
      console.log("XLSX -> PDF dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("=================================");

      execFile(
        SOFFICE_PATH,
        [
          "--headless",
          "--convert-to",
          "pdf",
          "--outdir",
          tempDir,
          inputPath,
        ],
        {
          windowsHide: true,
          timeout: 120000,
        },
        (error, stdout, stderr) => {
          console.log(
            "XLSX -> PDF stdout:",
            stdout
          );

          console.log(
            "XLSX -> PDF stderr:",
            stderr
          );

          if (error) {
            console.error(
              "XLSX -> PDF EXEC HATASI:",
              error
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            return res.status(500).json({
              error:
                "XLSX PDF'ye dönüştürülemedi.",
            });
          }

          if (!fs.existsSync(outputPath)) {
            console.error(
              "XLSX -> PDF: PDF oluşmadı."
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            return res.status(500).json({
              error:
                "PDF dosyası oluşturulamadı.",
            });
          }

          try {
            const pdfBuffer =
              fs.readFileSync(outputPath);

            res.set({
              "Content-Type":
                "application/pdf",
              "Content-Disposition":
                'attachment; filename="donusturulmus.pdf"',
              "Content-Length":
                pdfBuffer.length,
            });

            res.end(pdfBuffer);

            console.log(
              "XLSX -> PDF BAŞARILI!"
            );

            setTimeout(() => {
              try {
                fs.rmSync(tempDir, {
                  recursive: true,
                  force: true,
                });
              } catch {}
            }, 1000);
          } catch (error) {
            console.error(
              "XLSX PDF OKUMA HATASI:",
              error
            );

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "Oluşturulan PDF okunamadı.",
              });
            }
          }
        }
      );
    } catch (error) {
      console.error(
        "XLSX -> PDF HATASI:",
        error
      );

      if (tempDir) {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        } catch {}
      }

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "XLSX PDF'ye dönüştürülemedi.",
        });
      }
    }
  }
);

// ========================================
// PDF -> DOCX
// PYTHON + PyMuPDF + python-docx
// ========================================

app.post(
  "/convert/pdf-to-docx",
  upload.single("file"),
  async (req, res) => {
    let tempDir = null;

    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      if (!fs.existsSync(PYTHON_PATH)) {
        console.error(
          "Python bulunamadı:",
          PYTHON_PATH
        );

        return res.status(500).json({
          error: "Python bulunamadı.",
        });
      }

      if (!fs.existsSync(PYTHON_SCRIPT)) {
        console.error(
          "Python scripti bulunamadı:",
          PYTHON_SCRIPT
        );

        return res.status(500).json({
          error:
            "PDF dönüştürme scripti bulunamadı.",
        });
      }

      console.log("");
      console.log("=================================");
      console.log("PDF -> DOCX dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("Boyut:", req.file.size);
      console.log("=================================");

      tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "dosyadonusum-")
      );

      const inputPath = path.join(
        tempDir,
        "kaynak.pdf"
      );

      const outputPath = path.join(
        tempDir,
        "donusturulmus.docx"
      );

      fs.writeFileSync(
        inputPath,
        req.file.buffer
      );

      console.log(
        "PDF geçici dosyaya yazıldı."
      );

      console.log(
        "Python başlatılıyor..."
      );

      console.log(
        "Python:",
        PYTHON_PATH
      );

      console.log(
        "Script:",
        PYTHON_SCRIPT
      );

      const pythonProcess = spawn(
        PYTHON_PATH,
        [
          PYTHON_SCRIPT,
          inputPath,
          outputPath,
        ],
        {
          windowsHide: true,
        }
      );

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on(
        "data",
        (data) => {
          const text = data.toString();

          stdout += text;

          console.log(
            "Python:",
            text
          );
        }
      );

      pythonProcess.stderr.on(
        "data",
        (data) => {
          const text = data.toString();

          stderr += text;

          console.log(
            "Python uyarı:",
            text
          );
        }
      );

      pythonProcess.on(
        "error",
        (error) => {
          console.error(
            "Python başlatılamadı:",
            error
          );

          if (tempDir) {
            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}
          }

          if (!res.headersSent) {
            res.status(500).json({
              error:
                "Python çalıştırılamadı.",
            });
          }
        }
      );

      pythonProcess.on(
        "close",
        (code) => {
          console.log("=================================");
          console.log(
            "Python işlemi bitti."
          );

          console.log(
            "Çıkış kodu:",
            code
          );

          if (stderr) {
            console.log(
              "Python stderr:",
              stderr
            );
          }

          console.log("=================================");

          if (code !== 0) {
            console.error(
              "PDF -> DOCX PYTHON HATASI"
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "PDF DOCX'e dönüştürülemedi.",
              });
            }

            return;
          }

          if (!fs.existsSync(outputPath)) {
            console.error(
              "Python tamamlandı fakat DOCX oluşmadı."
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "DOCX dosyası oluşturulamadı.",
              });
            }

            return;
          }

          try {
            const docxBuffer =
              fs.readFileSync(outputPath);

            console.log(
              "PDF -> DOCX BAŞARILI!"
            );

            console.log(
              "DOCX boyutu:",
              docxBuffer.length,
              "byte"
            );

            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );

            res.setHeader(
              "Content-Disposition",
              'attachment; filename="donusturulmus.docx"'
            );

            res.setHeader(
              "Content-Length",
              docxBuffer.length
            );

            res.end(docxBuffer);

            console.log(
              "DOCX tarayıcıya gönderildi."
            );

            setTimeout(() => {
              if (tempDir) {
                try {
                  fs.rmSync(tempDir, {
                    recursive: true,
                    force: true,
                  });

                  console.log(
                    "Geçici dosyalar temizlendi."
                  );
                } catch {}
              }
            }, 1000);
          } catch (error) {
            console.error(
              "DOCX OKUMA HATASI:",
              error
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "Oluşturulan DOCX okunamadı.",
              });
            }
          }
        }
      );
    } catch (error) {
      console.error(
        "PDF -> DOCX HATASI:",
        error
      );

      if (tempDir) {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        } catch {}
      }

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "PDF DOCX'e dönüştürülemedi.",
        });
      }
    }
  }
);
// ========================================
// PDF -> TXT
// ========================================

app.post(
  "/convert/pdf-to-txt",
  upload.single("file"),
  async (req, res) => {
    let tempDir = null;

    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      console.log("");
      console.log("=================================");
      console.log("PDF -> TXT dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("Boyut:", req.file.size);
      console.log("=================================");

      tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "dosyadonusum-")
      );

      const inputPath = path.join(
        tempDir,
        "kaynak.pdf"
      );

      const outputPath = path.join(
        tempDir,
        "donusturulmus.txt"
      );

      fs.writeFileSync(
        inputPath,
        req.file.buffer
      );

      console.log(
        "PDF geçici dosyaya yazıldı."
      );

      const pythonCode = `
import sys
import fitz

pdf_path = sys.argv[1]
txt_path = sys.argv[2]

pdf = fitz.open(pdf_path)

with open(txt_path, "w", encoding="utf-8") as f:
    for page_number, page in enumerate(pdf):
        text = page.get_text()

        f.write(text)

        if page_number < len(pdf) - 1:
            f.write("\\n\\n")

pdf.close()

print("PDF -> TXT BAŞARILI!")
`;

      const pythonProcess = spawn(
        PYTHON_PATH,
        [
          "-c",
          pythonCode,
          inputPath,
          outputPath,
        ],
        {
          windowsHide: true,
        }
      );

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on(
        "data",
        (data) => {
          const text = data.toString();

          stdout += text;

          console.log(
            "Python:",
            text
          );
        }
      );

      pythonProcess.stderr.on(
        "data",
        (data) => {
          const text = data.toString();

          stderr += text;

          console.log(
            "Python uyarı:",
            text
          );
        }
      );

      pythonProcess.on(
        "error",
        (error) => {
          console.error(
            "Python başlatılamadı:",
            error
          );

          try {
            fs.rmSync(tempDir, {
              recursive: true,
              force: true,
            });
          } catch {}

          if (!res.headersSent) {
            res.status(500).json({
              error:
                "PDF TXT'ye dönüştürülemedi.",
            });
          }
        }
      );

      pythonProcess.on(
        "close",
        (code) => {
          console.log("=================================");
          console.log(
            "PDF -> TXT Python işlemi bitti."
          );
          console.log(
            "Çıkış kodu:",
            code
          );
          console.log("=================================");

          if (code !== 0) {
            console.error(
              "PDF -> TXT PYTHON HATASI:",
              stderr
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "PDF TXT'ye dönüştürülemedi.",
              });
            }

            return;
          }

          if (!fs.existsSync(outputPath)) {
            console.error(
              "TXT dosyası oluşmadı."
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "TXT dosyası oluşturulamadı.",
              });
            }

            return;
          }

          try {
            const txtBuffer =
              fs.readFileSync(outputPath);

            console.log(
              "PDF -> TXT BAŞARILI!"
            );

            console.log(
              "TXT boyutu:",
              txtBuffer.length,
              "byte"
            );

            res.setHeader(
              "Content-Type",
              "text/plain; charset=utf-8"
            );

            res.setHeader(
              "Content-Disposition",
              'attachment; filename="donusturulmus.txt"'
            );

            res.setHeader(
              "Content-Length",
              txtBuffer.length
            );

            res.end(txtBuffer);

            setTimeout(() => {
              try {
                fs.rmSync(tempDir, {
                  recursive: true,
                  force: true,
                });
              } catch {}
            }, 1000);
          } catch (error) {
            console.error(
              "TXT OKUMA HATASI:",
              error
            );

            try {
              fs.rmSync(tempDir, {
                recursive: true,
                force: true,
              });
            } catch {}

            if (!res.headersSent) {
              res.status(500).json({
                error:
                  "Oluşturulan TXT okunamadı.",
              });
            }
          }
        }
      );
    } catch (error) {
      console.error(
        "PDF -> TXT HATASI:",
        error
      );

      if (tempDir) {
        try {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        } catch {}
      }

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "PDF TXT'ye dönüştürülemedi.",
        });
      }
    }
  }
);
// ========================================
// JPG / PNG -> HEIC
// ========================================

app.post(
  "/convert/image-to-heic",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!(await checkUploadedFile(req, res))) {
  return;
}

      console.log("");
      console.log("=================================");
      console.log("JPG / PNG -> HEIC dönüşümü başladı");
      console.log("Dosya:", req.file.originalname);
      console.log("Boyut:", req.file.size);
      console.log("=================================");

      const outputBuffer = await sharp(req.file.buffer)
        .heif({
          compression: "hevc",
          quality: 90,
        })
        .toBuffer();

      console.log("JPG / PNG -> HEIC BAŞARILI!");
      console.log(
        "HEIC boyutu:",
        outputBuffer.length,
        "byte"
      );

      res.setHeader(
        "Content-Type",
        "image/heic"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="donusturulmus.heic"'
      );

      res.setHeader(
        "Content-Length",
        outputBuffer.length
      );

      res.end(outputBuffer);
    } catch (error) {
      console.error(
        "JPG / PNG -> HEIC HATASI:",
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          error:
            "Görsel HEIC formatına dönüştürülemedi.",
        });
      }
    }
  }
);
// ========================================
// SERVER
// ========================================
// Multer hata yönetimi

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "Dosya çok büyük. Maksimum dosya boyutu 50 MB.",
      });
    }

    return res.status(400).json({
      error: "Dosya yüklenemedi.",
    });
  }

  console.error("SUNUCU HATASI:", err);

  if (!res.headersSent) {
    return res.status(500).json({
      error: "Sunucu hatası oluştu.",
    });
  }

  next(err);
});

app.listen(5000, () => {
  console.log("=================================");
  console.log("Dönüştürme sunucusu çalışıyor!");
  console.log("http://localhost:5000");
  console.log("=================================");
});