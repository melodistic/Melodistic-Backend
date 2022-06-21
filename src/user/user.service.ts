import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    async findUserById(userId: string): Promise<any> {
        return await this.prisma.user.findFirst({
            where: {
                user_id: userId
            },
            select: {
                user_id: true,
                email: true
            }
        });
    }
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