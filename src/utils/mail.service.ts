import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariable } from "../config/env.types";
import * as sendgrid from '@sendgrid/mail';

@Injectable()
export class MailService {

    private mailService: sendgrid.MailService
    private fromAddress: string

    constructor(configService: ConfigService<EnvironmentVariable>) {
        this.mailService = sendgrid
        this.mailService.setApiKey(configService.get('SENDGRID_API_KEY', {infer: true}))
        this.fromAddress = configService.get('EMAIL_FROM_ADDRESS', {infer: true})
    }

    async sendEmail(to: string, subject: string, html: string) {
		await this.mailService.send({ from: this.fromAddress, to, subject, html })
	}
}