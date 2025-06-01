// app.js (Node.js server)
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const csv = require('csv-parser');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/list', (req, res) => {
  const data = fs.readFileSync('./buylist.json');
  res.json(JSON.parse(data));
});

app.get('/export', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./buylist.json'));
  const header = '\uFEFFDurum,Tarih,\u00dcr\u00fcn,Adet\n';
  const rows = data.map(item => `${item.durum},${item.tarih || ''},${item.urun},${item.adet}`).join('\n');
  res.setHeader('Content-Disposition', 'attachment; filename=alinacaklar_listesi.csv');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send(header + rows);
});

app.post('/save', (req, res) => {
  const updatedData = req.body;
  fs.writeFileSync('./buylist.json', JSON.stringify(updatedData, null, 2));
  res.sendStatus(200);
});

app.post('/import', upload.single('file'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: ',', headers: ['durum', 'tarih', 'urun', 'adet'], skipLines: 1 }))
    .on('data', (data) => {
      if (data.urun) results.push(data);
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      const current = JSON.parse(fs.readFileSync('./buylist.json'));
      const updated = current.concat(results);
      fs.writeFileSync('./buylist.json', JSON.stringify(updated, null, 2));
      res.json({ success: true });
    });
});

app.listen(PORT, () => {
  console.log(`BuyList app listening at http://localhost:${PORT}`);
});
