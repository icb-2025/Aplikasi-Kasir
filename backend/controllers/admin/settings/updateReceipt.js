import Settings from "../../../models/settings.js";

export const updateReceipt = async (req, res) => {
  try {
    const { receiptHeader, receiptFooter, showBarcode, showCashierName } =
      req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        receiptHeader,
        receiptFooter,
        showBarcode,
        showCashierName,
      });
    } else {
      if (receiptHeader !== undefined) settings.receiptHeader = receiptHeader;
      if (receiptFooter !== undefined) settings.receiptFooter = receiptFooter;
      if (showBarcode !== undefined) settings.showBarcode = showBarcode;
      if (showCashierName !== undefined)
        settings.showCashierName = showCashierName;
      await settings.save();
    }

    res.json({ message: "Struk berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};