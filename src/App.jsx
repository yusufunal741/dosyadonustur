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
    setProgress(5);

    progressTimer.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;

        if (current < 30) return current + 2;
        if (current < 60) return current + 1;

        return current + 0.5;
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
    if (!file) {
      setError("Lütfen önce bir dosya seç.");
      return;
    }

    const extension = getExtension(file.name);

    let endpoint = "";
    let outputName = "";

    if (
      (extension === "jpg" || extension === "jpeg") &&
      format === "PNG"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/jpg-to-png";
      outputName = "donusturulmus.png";
    } else if (
      extension === "png" &&
      format === "JPG"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/png-to-jpg";
      outputName = "donusturulmus.jpg";
    } else if (
      (extension === "jpg" ||
        extension === "jpeg" ||
        extension === "png") &&
      format === "PDF"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/image-to-pdf";
      outputName = "donusturulmus.pdf";
    } else if (
      extension === "pdf" &&
      format === "JPG"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/pdf-to-jpg";
      outputName = "donusturulmus-jpg.zip";
    } else if (
      extension === "pdf" &&
      format === "PNG"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/pdf-to-png";
      outputName = "donusturulmus-png.zip";
    } else if (
      extension === "pdf" &&
      format === "DOCX"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/pdf-to-docx";
      outputName = "donusturulmus.docx";
    } else if (
      extension === "pdf" &&
      format === "TXT"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/pdf-to-txt";
      outputName = "donusturulmus.txt";
    } else if (
      extension === "docx" &&
      format === "PDF"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/docx-to-pdf";
      outputName = "donusturulmus.pdf";
    } else if (
      extension === "pptx" &&
      format === "PDF"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/pptx-to-pdf";
      outputName = "donusturulmus.pdf";
    } else if (
      extension === "xlsx" &&
      format === "PDF"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/xlsx-to-pdf";
      outputName = "donusturulmus.pdf";
    } else if (
      (extension === "heic" ||
        extension === "heif") &&
      format === "JPG"
    ) {
      endpoint = "https://dosyadonustur-backend.onrender.com/convert/heic-to-jpg";
      outputName = "donusturulmus.jpg";
    } else {
      setError("Bu dönüşüm henüz aktif değil.");
      return;
    }

    try {
      setConverting(true);
      setSuccess(false);

      startProgressAnimation();

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage =
          "Sunucu hata verdi: " + response.status;

        try {
          const errorData = await response.json();

          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {}

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      stopProgressAnimation();
      setProgress(95);

      await new Promise((resolve) => {
        setTimeout(resolve, 600);
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = outputName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setProgress(100);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      setSuccess(true);
    } catch (error) {
      console.error(error);

      stopProgressAnimation();
      setProgress(0);
      setSuccess(false);

      setError(
        error.message || "Bir hata oluştu. Lütfen tekrar deneyin."
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

                <div className="upload-icon">
                  ⚙️
                </div>

                <h2>
                  ⏳ Dönüştürülüyor...
                </h2>

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