import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findUserByEmail(email: string): Promise<any> {
        return await this.prisma.user.findFirst({
            where: {
                email: email
            },
            select: {
                user_id: true,
                email: true
            }
        });
    }
}