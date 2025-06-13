import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeleteService {
    constructor(private readonly prisma: PrismaService) { }

    async deleteUser(userId: string) {
        try {
            // First check if user exists
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Delete user and all related records in a transaction
            await this.prisma.$transaction(async (prisma) => {
                // Delete related records first
                await prisma.userSetting.deleteMany({ where: { user_id: userId } });
                await prisma.roleUser.deleteMany({ where: { user_id: userId } });
                // await prisma.review.deleteMany({ where: { user_id: userId } });
                // await prisma.paymentTransaction.deleteMany({ where: { user_id: userId } });
                await prisma.message.deleteMany({
                    where: {
                        OR: [
                            { sender_id: userId },
                            { receiver_id: userId }
                        ]
                    }
                });
                await prisma.notification.deleteMany({
                    where: {
                        OR: [
                            { sender_id: userId },
                            { receiver_id: userId }
                        ]
                    }
                });

                // Finally delete the user
                await prisma.user.delete({
                    where: { id: userId }
                });
            });

            return { success: true, message: 'User and related records deleted successfully' };
        } catch (error) {
            // console.error("Delete User Error:", error);
            return { success: false, message: error.message };
        }
    }

    async deleteTransaction(transactionId: string) {
        try {
            // console.log("Attempting to delete transaction with ID:", transactionId);

            const transaction = await this.prisma.paymentTransaction.findFirst({
                where: { reference_number: transactionId, }
            });

            if (!transaction) {
                return { success: false, message: `Transaction with ID ${transactionId} not found` };
            }

            const deletedTransaction = await this.prisma.paymentTransaction.deleteMany({
                where: { reference_number: transactionId }
            });

            return {
                success: true,
                message: 'Transaction deleted successfully',
                data: deletedTransaction
            };
        } catch (error) {
            // console.error("Delete Transaction Error:", error);
            return { success: false, message: error.message };
        }
    }
} 