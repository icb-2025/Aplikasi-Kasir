import { createServer, createApp } from "./server.js";

// ============================================================
// Contoh penggunaan createServer (low level manual)
// ============================================================


// 1. GET sederhana
createServer((type, method) => {
  if (method.get) type.json({ message: "Hello dari GET" });
  else type.json({ message: "Method tidak ada" });
}).start(4000);

// 2. POST dengan body
createServer((type, method, body) => {
  if (method.post) type.json({ data: body });
  else type.json({ message: "Method tidak ada" });
}).start(4001);

// ============================================================
// Contoh penggunaan createApp (express style)
// ============================================================

const app = createApp();
const test = createApp();

// middleware logging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// middleware validasi body
app.use((req, res, next) => {
  if (req.method === "POST" && !req.body) {
    return next(new Error("Body tidak boleh kosong"));
  }
  next();
});

// routes
app.get("/", (req, res) => {
  res.text("Hello from createApp!");
});

app.get("/json", (req, res) => {
  res.json({ message: "Hello JSON", query: req.query });
});

app.post("/data", (req, res) => {
  res.json({ received: req.body });
});


app.start(5000, "Server createApp jalan di port 5000");



createServer((type, method, body) => {
    if(method.post) type.json({data: body})
        else type.json({message: "Method Tidak Ada"})
}).start(2500)


//bikin data dummy yang dikirim dari post ke get
const dummydata = [];

test.post("/add", (req, res) => {
    dummydata.push(req.body)
    res.json({allData: dummydata})
})

test.get("/", (req, res) => {
    res.json({allData: dummydata})
})
test.delete("/:nama", (req, res) => {
    const { id } = req.query;
    const index = dummydata.findIndex(item => item.id == id);
    if (index !== -1) {
        dummydata.splice(index, 1);
        res.json({ message: "Data deleted", allData: dummydata });
    } else {
        res.json({ message: "Data not found", allData: dummydata });
    }
});

test.start(6001)