import { UnsupportedMediaTypeException } from "@nestjs/common"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"

export const fileFilter: MulterOptions['fileFilter'] = (_, file, cb) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/heic')
		return cb(null, true)
	cb(new UnsupportedMediaTypeException('Only png, jpeg and heic images are allowed'), false)
}
export const uploadPath = '/app/uploads/'
