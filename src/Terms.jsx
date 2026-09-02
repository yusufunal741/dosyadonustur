import React from "react";

function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-container">

        <div className="legal-header">
          <a href="/" className="legal-logo">
            Dosya<span>Dönüştür</span>
          </a>

          <a href="/" className="legal-home-button">
            ← Ana Sayfaya Dön
          </a>
        </div>

        <div className="legal-hero">
          <div className="legal-icon">📋</div>

          <div>
            <span className="legal-label">YASAL BİLGİ</span>
            <h1>Kullanım Şartları</h1>
            <p>
              DosyaDönüştür hizmetini kullanırken geçerli olan şartlar.
            </p>
          </div>
        </div>

        <div className="legal-content">

          <section>
            <h2>1. Hizmetin Kullanımı</h2>
            <p>
              DosyaDönüştür, kullanıcıların desteklenen dosya formatları
              arasında dönüşüm gerçekleştirmesine yardımcı olan bir
              hizmettir.
            </p>
          </section>

          <section>
            <h2>2. Kullanıcının Sorumlulukları</h2>
            <p>
              Kullanıcı, yüklediği dosyalar üzerinde gerekli haklara
              sahip olduğunu ve hizmeti yürürlükteki yasalara uygun
              şekilde kullanacağını kabul eder.
            </p>
          </section>

          <section>
            <h2>3. Yasaklanan Kullanımlar</h2>
            <p>
              Hizmet; yasa dışı faaliyetler, başkalarının haklarını
              ihlal eden içerikler veya sistemin güvenliğini tehdit eden
              faaliyetler amacıyla kullanılamaz.
            </p>
          </section>

          <section>
            <h2>4. Hizmetin Kullanılabilirliği</h2>
            <p>
              Hizmetin sürekli, kesintisiz veya hatasız çalışacağı
              garanti edilmez. Teknik bakım, güncelleme veya beklenmeyen
              teknik sorunlar nedeniyle hizmet geçici olarak
              kullanılamayabilir.
            </p>
          </section>

          <section>
            <h2>5. Sorumluluk</h2>
            <p>
              Kullanıcıların yüklediği dosyaların içeriğinden kullanıcılar
              sorumludur. DosyaDönüştür, kullanıcı tarafından yüklenen
              içeriklerin hukuki niteliğinden sorumlu değildir.
            </p>
          </section>

          <section>
            <h2>6. Değişiklikler</h2>
            <p>
              Bu kullanım şartları gerektiğinde güncellenebilir. Yapılan
              değişiklikler web sitesinde yayımlandığı tarihten itibaren
              geçerli olur.
            </p>
          </section>

        </div>

        <div className="legal-footer">
          <span>Son güncelleme: 2 Eylül 2026</span>

          <div>
            <a href="/privacy">Gizlilik Politikası</a>
            <a href="/kvkk">KVKK</a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Terms;