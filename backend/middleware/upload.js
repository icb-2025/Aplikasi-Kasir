import multer from "multer";

// simpan di memory → biar gampang langsung lempar ke cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;

