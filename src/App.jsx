import { useState, useEffect, useRef } from "react";
import "./App.css";

import Privacy from "./Privacy";
import Terms from "./Terms";
import Kvkk from "./KvkkTemp";

function App() {
  const currentPath = window.location.pathname;

  const savedDarkMode =
    localStorage.getItem("darkMode") === "true";

  document.body.classList.toggle(
    "dark-mode",
    savedDarkMode
  );

  if (currentPath === "/privacy") {
    return <Privacy />;
  }

  if (currentPath === "/kvkk") {
    return <Kvkk />;
  }

  if (currentPath === "/terms") {
    return <Terms />;
  }

  return <MainApp />;
}

function MainApp() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("PDF");
  const [dragging, setDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const progressTimer = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  function getExtension(filename) {
    const parts = filename.split(".");
    return parts[parts.length - 1].toLowerCase();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function setSelectedFile(selectedFile) {
    if (!selectedFile) return;

    // 50 MB dosya boyutu kontrolü
    const maxFileSize = 50 * 1024 * 1024;

    if (selectedFile.size > maxFileSize) {
      setFile(null);
      setPreview(null);
      setSuccess(false);
      setProgress(0);
      setError(
        "Dosya çok büyük. Maksimum dosya boyutu 50 MB."
      );
      return;
    }

    setFile(selectedFile);
    setSuccess(false);
    setError("");
    setProgress(0);

    const extension = getExtension(selectedFile.name);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png"
    ) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }

    if (extension === "pdf") {
      setFormat("JPG");
    } else if (extension === "docx") {
      setFormat("PDF");
    } else if (
      extension === "jpg" ||
      extension === "jpeg"
    ) {
      setFormat("PDF");
    } else if (extension === "png") {
      setFormat("PDF");
    } else if (extension === "pptx") {
      setFormat("PDF");
    } else if (extension === "xlsx") {
      setFormat("PDF");
    } else if (
      extension === "heic" ||
      extension === "heif"
    ) {
      setFormat("JPG");
    }
  }

  function selectFile(event) {
    const selectedFile = event.target.files[0];
    setSelectedFile(selectedFile);
  }

  function dropFile(event) {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    setSelectedFile(droppedFile);
  }

  function getFormats() {
    if (!file) return [];

    const extension = getExtension(file.name);

    if (extension === "pdf") {
      return ["JPG", "PNG", "DOCX", "TXT"];
    }

    if (extension === "docx") {
      return ["PDF"];
    }

    if (
      extension === "jpg" ||
      extension === "jpeg"
    ) {
      return ["PDF", "PNG"];
    }

    if (extension === "png") {
      return ["PDF", "JPG"];
    }

    if (extension === "pptx") {
      return ["PDF"];
    }

    if (extension === "xlsx") {
      return ["PDF"];
    }

    if (
      extension === "heic" ||
      extension === "heif"
    ) {
      return ["JPG"];
    }

    return [];
  }

  function startProgressAnimation() {
  setProgress(3);

  progressTimer.current = setInterval(() => {
    setProgress((current) => {
      // İlk aşama: yükleme / hazırlık
      if (current < 25) {
        return current + 2;
      }

      // İkinci aşama: sunucuda işlem yapılıyor
      if (current < 50) {
        return current + 1;
      }

      // Üçüncü aşama: işlem devam ediyor
      if (current < 70) {
        return current + 0.5;
      }

      // İşlem uzun sürerse burada yavaşlar
      // ve 90'da sabitlenir.
      if (current < 90) {
        return current + 0.2;
      }

      return current;
    });
  }, 150);
}

  function stopProgressAnimation() {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }

  useEffect(() => {
    return () => {
      stopProgressAnimation();

      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function convertFile() {
  if (!file) return;

  let endpoint = "";
  let newExtension = "";

  const type = file.type;
  const name = file.name.toLowerCase();

  // JPG → PNG
  if (
    (type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) &&
    format === "PNG"
  ) {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/jpg-to-png";
    newExtension = "png";
  }

  // PNG → JPG
  else if (
    (type === "image/png" || name.endsWith(".png")) &&
    format === "JPG"
  ) {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/png-to-jpg";
    newExtension = "jpg";
  }

  // JPG / PNG → PDF
  else if (
    (type === "image/jpeg" ||
      type === "image/png" ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png")) &&
    format === "PDF"
  ) {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/image-to-pdf";
    newExtension = "pdf";
  }

  // PDF → JPG
  else if (name.endsWith(".pdf") && format === "JPG") {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/pdf-to-jpg";
    newExtension = "zip";
  }

  // PDF → PNG
  else if (name.endsWith(".pdf") && format === "PNG") {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/pdf-to-png";
    newExtension = "zip";
  }

  // PDF → DOCX
  else if (name.endsWith(".pdf") && format === "DOCX") {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/pdf-to-docx";
    newExtension = "docx";
  }

  // PDF → TXT
  else if (name.endsWith(".pdf") && format === "TXT") {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/pdf-to-txt";
    newExtension = "txt";
  }

  // DOCX → PDF
  else if (name.endsWith(".docx") && format === "PDF") {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/docx-to-pdf";
    newExtension = "pdf";
  }

  // PPTX → PDF
  else if (name.endsWith(".pptx") && format === "PDF") {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/pptx-to-pdf";
    newExtension = "pdf";
  }

  // XLSX → PDF
  else if (name.endsWith(".xlsx") && format === "PDF") {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/xlsx-to-pdf";
    newExtension = "pdf";
  }

  // HEIC / HEIF → JPG
  else if (
    (name.endsWith(".heic") || name.endsWith(".heif")) &&
    format === "JPG"
  ) {
    endpoint =
      "https://dosyadonustur-backend2.onrender.com/convert/heic-to-jpg";
    newExtension = "jpg";
  }

  else {
    setError("Bu dosya türü için dönüştürme desteklenmiyor.");
    return;
  }

  setConverting(true);
  setSuccess(false);
  setError("");
  startProgressAnimation();

  const formData = new FormData();
  formData.append("file", file);

  try {
    /*
      XMLHttpRequest kullanıyoruz.

      Bunun avantajı:
      - Dosyanın sunucuya yüklenme yüzdesini gerçekten görebiliyoruz.
      - Sunucudan gelen dosyanın indirilme durumunu takip edebiliyoruz.
      - Kullanıcı artık sadece sahte şekilde 90%'da beklemiyor.
    */

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", endpoint, true);

      // Dönen cevabı Blob olarak al
      xhr.responseType = "blob";

      // 5 dakika timeout
      xhr.timeout = 300000;

      // ------------------------------------
      // DOSYANIN SUNUCUYA YÜKLENME DURUMU
      // ------------------------------------
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;

        const uploadPercent =
          (event.loaded / event.total) * 25;

        setProgress((current) =>
          Math.max(current, Math.min(25, uploadPercent))
        );
      };

      // ------------------------------------
      // SUNUCUDAN DOSYA GELİRKEN
      // ------------------------------------
      xhr.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const downloadPercent =
          (event.loaded / event.total) * 15;

        setProgress((current) =>
          Math.max(
            current,
            Math.min(100, 85 + downloadPercent)
          )
        );
      };

      // ------------------------------------
      // İŞLEM TAMAMLANDI
      // ------------------------------------
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          resolve(xhr.response);
        } else {
          // Backend JSON hata mesajı döndürürse
          // onu okumaya çalışıyoruz.
          if (
            xhr.response &&
            xhr.response.type === "application/json"
          ) {
            const reader = new FileReader();

            reader.onload = () => {
              try {
                const data = JSON.parse(reader.result);

                reject(
                  new Error(
                    data.error ||
                      "Dönüştürme sırasında bir hata oluştu."
                  )
                );
              } catch {
                reject(
                  new Error(
                    "Dönüştürme sırasında bir hata oluştu."
                  )
                );
              }
            };

            reader.onerror = () => {
              reject(
                new Error(
                  "Dönüştürme sırasında bir hata oluştu."
                )
              );
            };

            reader.readAsText(xhr.response);
          } else {
            reject(
              new Error(
                "Dönüştürme sırasında bir hata oluştu."
              )
            );
          }
        }
      };

      // ------------------------------------
      // HATALAR
      // ------------------------------------
      xhr.onerror = () => {
        reject(
          new Error(
            "Sunucuya bağlanırken bir hata oluştu."
          )
        );
      };

      xhr.ontimeout = () => {
        reject(
          new Error(
            "İşlem çok uzun sürdü. Lütfen tekrar deneyin."
          )
        );
      };

      xhr.onabort = () => {
        reject(
          new Error("Dönüştürme işlemi iptal edildi.")
        );
      };

      xhr.send(formData);
    });

    stopProgressAnimation();

    // Tamamlandı
    setProgress(100);

    // Küçük bir geçiş
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    // ------------------------------------
    // DOSYA ADINI OLUŞTUR
    // ------------------------------------

    const originalName = file.name;

    const lastDot =
      originalName.lastIndexOf(".");

    const baseName =
      lastDot !== -1
        ? originalName.substring(0, lastDot)
        : originalName;

    const newFileName =
      `${baseName}.${newExtension}`;

    // ------------------------------------
    // DOSYAYI İNDİR
    // ------------------------------------

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = newFileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    // URL'yi temizle
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    setSuccess(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );
  } catch (err) {
    console.error("Conversion error:", err);

    stopProgressAnimation();

    setProgress(0);

    setError(
      err?.message ||
        "Dönüştürme sırasında bir hata oluştu."
    );
  } finally {
    setConverting(false);
  }
}

  function removeFile() {
    stopProgressAnimation();

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setFormat("PDF");
    setSuccess(false);
    setError("");
    setProgress(0);
    setPreview(null);
  }

  function getFormatIcon(item) {
    if (item === "PDF") return "📄";
    if (item === "JPG") return "🖼️";
    if (item === "PNG") return "🌄";
    if (item === "DOCX") return "📝";
    if (item === "TXT") return "📃";

    return "📁";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="app">

      <header className="navbar">

        <a
          href="/"
          className="logo"
          onClick={closeMenu}
        >
          Dosya<span>Dönüştür</span>
        </a>

        <nav className={menuOpen ? "mobile-open" : ""}>

          <a href="#anasayfa" onClick={closeMenu}>
            Ana Sayfa
          </a>

          <a href="#donustur" onClick={closeMenu}>
            Dönüştür
          </a>

          <a href="#ozellikler" onClick={closeMenu}>
            Özellikler
          </a>

          <a href="#hakkimizda" onClick={closeMenu}>
            Hakkımızda
          </a>

        </nav>

        <div className="navbar-actions">

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Tema değiştir"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menüyü aç"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

      </header>

      <main>

        <section className="hero" id="anasayfa">

          <div className="hero-content">

            <div className="badge">
              🚀 Hızlı ve kolay dosya dönüşümü
            </div>

            <h1>
              Dosyalarını{" "}
              <span>kolayca dönüştür.</span>
            </h1>

            <p>
              PDF, Word, JPG, PNG, HEIC, TXT,
              PowerPoint ve Excel dosyalarını hızlı
              ve güvenli bir şekilde istediğin formata
              dönüştür.
            </p>

            <div className="hero-trust">

              <div>
                🔒 <strong>Güvenli</strong>
              </div>

              <div>
                ⚡ <strong>Hızlı</strong>
              </div>

              <div>
                🆓 <strong>Ücretsiz</strong>
              </div>

            </div>

          </div>

          <div
            className={
              dragging
                ? "hero-card dragging"
                : "hero-card"
            }
            id="donustur"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => {
              setDragging(false);
            }}
            onDrop={dropFile}
          >

            {error && (
              <div className="error-message">

                <div className="error-icon">
                  ⚠️
                </div>

                <div className="error-content">

                  <strong>
                    Bir sorun oluştu
                  </strong>

                  <p>
                    {error}
                  </p>

                </div>

                <button
                  type="button"
                  className="error-close"
                  onClick={() => setError("")}
                  aria-label="Hatayı kapat"
                >
                  ✕
                </button>

              </div>
            )}

            {!file && (
              <>

                <div className="upload-icon">
                  📁
                </div>

                <h2>
                  Dosyanı buraya bırak
                </h2>

                <p>
                  veya bilgisayarından bir dosya seç
                </p>

                <label className="upload-button">
                  Dosya Seç

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.docx,.pptx,.xlsx"
                    onChange={selectFile}
                    style={{ display: "none" }}
                  />

                </label>

                <small>
                  Desteklenen formatlar:
                  PDF, DOCX, JPG, PNG, HEIC, PPTX, XLSX
                </small>

              </>
            )}

            {file && !success && !converting && (
              <>

                {preview ? (
                  <img
                    src={preview}
                    alt="Dosya önizleme"
                    className="file-preview"
                  />
                ) : (
                  <div className="upload-icon">

                    {getExtension(file.name) === "docx"
                      ? "📝"
                      : getExtension(file.name) === "pptx"
                      ? "📊"
                      : getExtension(file.name) === "xlsx"
                      ? "📈"
                      : getExtension(file.name) === "heic" ||
                        getExtension(file.name) === "heif"
                      ? "🖼️"
                      : "📄"}

                  </div>
                )}

                <h2>
                  Dosya hazır!
                </h2>

                <div className="file-info">

                  <p>
                    {file.name}
                  </p>

                  <small>
                    {formatFileSize(file.size)}
                  </small>

                </div>

                <p>
                  Dönüştürülecek format:
                </p>

                <div className="format-options">

                  {getFormats().map((item) => (

                    <button
                      type="button"
                      key={item}
                      className={
                        format === item
                          ? "format-option active"
                          : "format-option"
                      }
                      onClick={() => {
                        setFormat(item);
                        setSuccess(false);
                        setError("");
                      }}
                    >

                      <span className="format-icon">
                        {getFormatIcon(item)}
                      </span>

                      <span className="format-name">
                        {item}
                      </span>

                    </button>

                  ))}

                </div>

                <button
                  className="upload-button"
                  onClick={convertFile}
                >
                  🔄 Dönüştür
                </button>

                <button
                  type="button"
                  className="remove-file-button"
                  onClick={removeFile}
                >
                  <span>✕</span>
                  Dosyayı kaldır
                </button>

              </>
            )}

            {converting && (
              <>

                <div className="conversion-animation">

  <div className="gear-icon">
    ⚙️
  </div>

</div>

<div className="converting-title">
  <div className="hourglass-icon">
    ⏳
  </div>

  <h2>Dönüştürülüyor...</h2>
</div>

                <p>
                  {file.name}
                </p>

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width: progress + "%"
                    }}
                  />

                </div>

                <strong className="progress-number">
                  %{Math.floor(progress)}
                </strong>

                <small>
                  Lütfen bekleyin...
                </small>

              </>
            )}

            {success && (
              <>

                <div className="upload-icon">
                  ✅
                </div>

                <h2>
                  Dönüştürme tamamlandı! 🎉
                </h2>

                <p>
                  Dosyan başarıyla dönüştürüldü
                  ve indirildi.
                </p>

                <button
                  className="upload-button"
                  onClick={removeFile}
                >
                  Yeni dosya dönüştür
                </button>

              </>
            )}

          </div>

        </section>

        <section className="trust-section">

          <div className="section-title">

            <span>🛡️</span>

            <h2>
              Dosyaların güvende
            </h2>

            <p>
              Dosyalarını dönüştürürken
              güvenliğini ön planda tutuyoruz.
            </p>

          </div>

          <div className="trust-grid">

            <div className="trust-card">

              <div className="trust-icon">
                🔒
              </div>

              <h3>
                Güvenilir Dosyalar
              </h3>

              <p>
                Dosyaların yalnızca dönüşüm
                işlemi için kullanılır.
              </p>

            </div>

            <div className="trust-card">

              <div className="trust-icon">
                ⚡
              </div>

              <h3>
                Hızlı Dönüşüm
              </h3>

              <p>
                Dosyalarını hızlı ve kolay
                bir şekilde dönüştür.
              </p>

            </div>

            <div className="trust-card">

              <div className="trust-icon">
                🗑️
              </div>

              <h3>
                Geçici Dosyalar
              </h3>

              <p>
                Dönüşüm sırasında kullanılan
                geçici dosyalar işlem sonrasında temizlenir.
              </p>

            </div>

            <div className="trust-card">

              <div className="trust-icon">
                🆓
              </div>

              <h3>
                Ücretsiz Kullanım
              </h3>

              <p>
                Temel dosya dönüşümlerini
                ücretsiz olarak kullan.
              </p>

            </div>

          </div>

        </section>

        <section
          className="features-section"
          id="ozellikler"
        >

          <div className="section-title">

            <span>✨</span>

            <h2>
              Nasıl çalışır?
            </h2>

            <p>
              Dosyanı birkaç basit adımda dönüştür.
            </p>

          </div>

          <div className="features-grid">

            <div className="feature-card">

              <div className="feature-number">
                01
              </div>

              <div className="feature-icon">
                📤
              </div>

              <h3>
                Dosyanı yükle
              </h3>

              <p>
                Dosyanı sürükleyip bırak veya
                bilgisayarından seç.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-number">
                02
              </div>

              <div className="feature-icon">
                🔄
              </div>

              <h3>
                Formatını seç
              </h3>

              <p>
                Dosyan için uygun olan dönüşüm
                formatını seç.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-number">
                03
              </div>

              <div className="feature-icon">
                📥
              </div>

              <h3>
                Dosyanı indir
              </h3>

              <p>
                Dönüşüm tamamlandığında dosyan
                otomatik olarak indirilir.
              </p>

            </div>

          </div>

        </section>

        <section className="formats-section">

          <div className="section-title">

            <span>📂</span>

            <h2>
              Desteklenen formatlar
            </h2>

            <p>
              En sık kullanılan dosya formatlarını
              kolayca dönüştür.
            </p>

          </div>

          <div className="supported-formats">

            <div className="supported-format">
              <span>📄</span>
              <strong>PDF</strong>
              <small>Belgeler</small>
            </div>

            <div className="supported-format">
              <span>📝</span>
              <strong>DOCX</strong>
              <small>Word belgeleri</small>
            </div>

            <div className="supported-format">
              <span>🖼️</span>
              <strong>JPG</strong>
              <small>Görseller</small>
            </div>

            <div className="supported-format">
              <span>🌄</span>
              <strong>PNG</strong>
              <small>Görseller</small>
            </div>

            <div className="supported-format">
              <span>📃</span>
              <strong>TXT</strong>
              <small>Metin dosyaları</small>
            </div>

            <div className="supported-format">
              <span>🖼️</span>
              <strong>HEIC</strong>
              <small>iPhone görselleri</small>
            </div>

            <div className="supported-format">
              <span>📊</span>
              <strong>PPTX</strong>
              <small>PowerPoint</small>
            </div>

            <div className="supported-format">
              <span>📈</span>
              <strong>XLSX</strong>
              <small>Excel dosyaları</small>
            </div>

          </div>

        </section>

        <section
          className="about-section"
          id="hakkimizda"
        >

          <div className="about-content">

            <div className="about-icon">
              💜
            </div>

            <div>

              <span className="about-label">
                HAKKIMIZDA
              </span>

              <h2>
                Dosya dönüşümünü
                <br />
                daha kolay hale getiriyoruz.
              </h2>

              <p>
                DosyaDönüştür, farklı dosya
                formatları arasında hızlı ve
                kolay dönüşüm yapabilmen için
                geliştirilen basit ve kullanışlı
                bir dosya dönüştürme aracıdır.
              </p>

              <p>
                Amacımız karmaşık programlara
                ihtiyaç duymadan dosyalarını
                birkaç tıklamayla dönüştürebileceğin
                sade bir deneyim sunmak.
              </p>

            </div>

          </div>

        </section>

      </main>

      <footer className="footer">

        <div className="footer-content">

          <div className="footer-brand">

            <div className="logo">
              Dosya<span>Dönüştür</span>
            </div>

            <p>
              Dosyalarını kolayca dönüştür.
            </p>

          </div>

          <div className="footer-links">

            <a href="#anasayfa">
              Ana Sayfa
            </a>

            <a href="#donustur">
              Dönüştür
            </a>

            <a href="#ozellikler">
              Özellikler
            </a>

            <a href="#hakkimizda">
              Hakkımızda
            </a>

            <a href="/privacy">
              Gizlilik Politikası
            </a>

            <a href="/kvkk">
              KVKK
            </a>

            <a href="/terms">
              Kullanım Şartları
            </a>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 DosyaDönüştür
          </span>

          <span>
            Güvenli • Hızlı • Kolay
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;