import Cart from "../models/cart.js";
import Barang from "../models/databarang.js";

// Get cart user
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambah item ke cart
export const addToCart = async (req, res) => {
  try {
    const { barangId, quantity } = req.body;

    const barang = await Barang.findById(barangId);
    if (!barang) return res.status(404).json({ message: "Barang tidak ditemukan" });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.barangId.toString() === barangId
    );  

    if (itemIndex > -1) {
      // update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
  barangId,
  name: barang.nama_barang,
  price: barang.hargaFinal ?? barang.harga_jual,
  quantity,
  image: barang.gambar_url,
});

    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Hapus 1 item dari cart
export const removeFromCart = async (req, res) => {
  try {
    const { barangId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Keranjang kosong" });

    cart.items = cart.items.filter(
      (item) => item.barangId.toString() !== barangId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Keranjang dikosongkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
