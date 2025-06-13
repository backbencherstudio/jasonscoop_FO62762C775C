import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CheckoutRepository {
  /**
   * calculate total price
   * @returns
   */
  static async calculateTotalPrice(checkout_id: string) {
    const coupon_prices = await this.calculateCoupon(checkout_id);
    const subtotal = await this.calculateSubTotalPrice(checkout_id);

    if (coupon_prices.length > 0) {
      let total = 0.0;
      for (const coupon of coupon_prices) {
        if (coupon.amount_type == 'percentage') {
          total += (subtotal * Number(coupon.amount)) / 100;
        } else {
          total += Number(coupon.amount);
        }
      }
      return total;
    } else {
      return subtotal;
    }
  }

  static async calculateSubTotalPrice(checkout_id: string) {
    const checkout = await prisma.checkout.findUnique({
      where: {
        id: checkout_id,
      },
      include: {
        checkout_items: {
          include: {
            product: true,
          },
        },
      },
    });

    let subtotal: number = 0;
    // calculate subtotal
    for (const item of checkout.checkout_items) {
      subtotal += Number(item.product.price) * item.quantity;
    }

    return subtotal;
  }

  static async calculateCoupon(checkout_id: string) {
    const checkout = await prisma.checkout.findUnique({
      where: {
        id: checkout_id,
      },
    });
    if (checkout && checkout.user_id) {
      const temp_redems = await prisma.tempRedeem.findMany({
        where: {
          checkout_id: checkout_id,
        },
        include: {
          coupon: true,
        },
      });

      const amountArray = [];
      for (const redeem of temp_redems) {
        if (redeem.coupon.method == 'code') {
          amountArray.push({
            amount: Number(redeem.coupon.amount),
            amount_type: redeem.coupon.amount_type,
          });
        }
      }

      return amountArray;
    } else {
      return [];
    }
  }
}
