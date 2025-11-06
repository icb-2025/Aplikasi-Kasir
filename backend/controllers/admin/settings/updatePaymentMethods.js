import Settings from "../../../models/settings.js";
import cloudinary from "../../../config/cloudinary.js";

export const updatePaymentMethods = async (req, res) => {
  try {
    const { payment_methods } = req.body;

    let methods = JSON.parse(payment_methods);

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "payment_methods",
      });

      fs.unlinkSync(req.file.path);

      const { methodName, channelName } = req.body;

      methods = methods.map(m => {
        if (m.method === methodName) {
          m.channels = m.channels.map(c =>
            c.name === channelName
              ? { ...c, logo: uploadResult.secure_url }
              : c
          );
        }
        return m;
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ payment_methods: methods });
    } else {
      settings.payment_methods = methods;
      await settings.save();
    }

    res.json({ message: "Metode pembayaran berhasil diperbarui!", settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
