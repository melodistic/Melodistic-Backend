import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt';
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		})
	}

	async validate(payload: any) {
		return { user_id: payload.id };
	}
}