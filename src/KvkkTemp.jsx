import React from "react";

function Kvkk() {
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
          <div className="legal-icon">🛡️</div>

          <div>
            <span className="legal-label">YASAL BİLGİ</span>
            <h1>KVKK Aydınlatma Metni</h1>
            <p>
              Kişisel verilerin işlenmesine ilişkin bilgilendirme.
            </p>
          </div>
        </div>

        <div className="legal-content">

          <section>
            <h2>1. Veri Sorumlusu</h2>
            <p>
              DosyaDönüştür hizmetinin işletilmesinden sorumlu kişi veya
              kuruluş, yürürlükteki mevzuat kapsamında veri sorumlusu
              sıfatına sahip olabilir.
            </p>
          </section>

          <section>
            <h2>2. İşlenen Veriler</h2>
            <p>
              Hizmetin kullanımına bağlı olarak IP adresi, teknik bağlantı
              bilgileri, cihaz ve tarayıcı bilgileri gibi teknik veriler
              işlenebilir. Yüklenen dosyalar ise dönüşüm işleminin
              gerçekleştirilebilmesi amacıyla işlenir.
            </p>
          </section>

          <section>
            <h2>3. İşleme Amaçları</h2>
            <p>
              Veriler; hizmetin sunulması, güvenliğin sağlanması, teknik
              sorunların giderilmesi ve yasal yükümlülüklerin yerine
              getirilmesi amaçlarıyla işlenebilir.
            </p>
          </section>

          <section>
            <h2>4. Saklama Süresi</h2>
            <p>
              Yüklenen dosyalar, dönüşüm işleminin gerektirdiği süre
              boyunca geçici olarak işlenebilir. İşlem tamamlandıktan
              sonra geçici dosyaların silinmesi amaçlanmaktadır.
            </p>
          </section>

          <section>
            <h2>5. Kullanıcı Hakları</h2>
            <p>
              KVKK'nın 11. maddesi kapsamında ilgili kişilerin sahip
              olduğu haklar bulunmaktadır. Bu hakların kullanılması için
              hizmet sağlayıcının iletişim kanalları üzerinden başvuru
              yapılabilir.
            </p>
          </section>

          <section>
            <h2>6. İletişim</h2>
            <p>
              Kişisel verilerle ilgili talepleriniz için web sitesinde
              belirtilen iletişim kanalını kullanabilirsiniz.
            </p>
          </section>

        </div>

        <div className="legal-footer">
          <span>Son güncelleme: 2 Eylül 2026</span>

          <div>
            <a href="/privacy">Gizlilik Politikası</a>
            <a href="/terms">Kullanım Şartları</a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Kvkk;