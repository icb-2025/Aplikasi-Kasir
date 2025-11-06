import Settings from "../../../models/settings.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    if ((settings.serviceCharge === undefined || settings.serviceCharge === null) && typeof settings.calculatedServiceCharge === "number") {
      settings.serviceCharge = settings.calculatedServiceCharge;
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};