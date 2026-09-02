import React from "react";

function Privacy() {
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
          <div className="legal-icon">🔒</div>

          <div>
            <span className="legal-label">GİZLİLİK</span>
            <h1>Gizlilik Politikası</h1>
            <p>
              DosyaDönüştür olarak gizliliğinize önem veriyoruz.
            </p>
          </div>
        </div>

        <div className="legal-content">

          <section>
            <h2>1. Dosyalarınız</h2>
            <p>
              Dönüştürme amacıyla yüklediğiniz dosyalar yalnızca ilgili
              işlemi gerçekleştirmek amacıyla kullanılır. Dosyalarınızın
              gereksiz şekilde saklanmaması ve işlem tamamlandıktan sonra
              geçici dosyaların temizlenmesi amaçlanmaktadır.
            </p>
          </section>

          <section>
            <h2>2. Kişisel Veriler</h2>
            <p>
              Hizmetin kullanımı sırasında gerekli olmayan kişisel
              bilgileri toplamamaya özen gösteriyoruz. Kişisel veriler
              yalnızca hizmetin sunulması veya yasal yükümlülüklerin
              yerine getirilmesi için gerekli olduğu durumlarda işlenebilir.
            </p>
          </section>

          <section>
            <h2>3. Çerezler</h2>
            <p>
              Web sitesinin düzgün çalışması ve kullanıcı deneyiminin
              geliştirilmesi amacıyla teknik çerezler veya benzer
              teknolojiler kullanılabilir.
            </p>
          </section>

          <section>
            <h2>4. Üçüncü Taraf Hizmetler</h2>
            <p>
              İleride reklam, analiz veya benzeri üçüncü taraf hizmetleri
              kullanılması halinde, bu hizmetlerin kendi gizlilik
              politikaları da geçerli olabilir.
            </p>
          </section>

          <section>
            <h2>5. Güvenlik</h2>
            <p>
              Kullanıcı dosyalarının ve sistemin güvenliğini sağlamak için
              uygun teknik önlemler alınmaktadır. Bununla birlikte internet
              üzerinden gerçekleştirilen hiçbir veri aktarımının tamamen
              risksiz olduğu garanti edilemez.
            </p>
          </section>

          <section>
            <h2>6. Politika Değişiklikleri</h2>
            <p>
              Bu gizlilik politikası gerektiğinde güncellenebilir.
              Güncellenmiş politika web sitesi üzerinden yayımlandığı
              tarihten itibaren geçerli olur.
            </p>
          </section>

        </div>

        <div className="legal-footer">
          <span>Son güncelleme: 2 Eylül 2026</span>

          <div>
            <a href="/kvkk">KVKK</a>
            <a href="/terms">Kullanım Şartları</a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Privacy;