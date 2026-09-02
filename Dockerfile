FROM node:22-bookworm

# Python + LibreOffice + gerekli sistem paketleri
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# Python paketleri
RUN pip3 install --break-system-packages \
    PyMuPDF \
    python-docx

# Proje klasörü
WORKDIR /app

# Node paketlerini kur
COPY package*.json ./
RUN npm install

# Projenin tamamını kopyala
COPY . .

# Render'ın vereceği portu kullan
ENV NODE_ENV=production

EXPOSE 10000

CMD ["node", "server.cjs"]