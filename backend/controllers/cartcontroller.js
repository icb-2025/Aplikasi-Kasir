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
      cart.items[itemIndex].quantity += quantity;

      // kalau quantity hasilnya 0 atau kurang, hapus item itu
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else if (quantity > 0) {
      cart.items.push({
        barangId,
        name: barang.nama_barang,
        price: barang.hargaFinal ?? barang.harga_jual,
        quantity,
        image: barang.gambar_url,
      });
    }

    // kalau cart kosong setelah update -> hapus dokumen
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId: req.user.id });
      return res.json({ message: "Keranjang dihapus karena kosong" });
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

    // kalau udah kosong, hapus dokumen langsung
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId: req.user.id });
      return res.json({ message: "Keranjang dihapus karena kosong" });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteOne({ userId: req.user.id });
    res.json({ message: "Keranjang dikosongkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
