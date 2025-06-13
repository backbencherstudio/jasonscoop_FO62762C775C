import { Injectable } from '@nestjs/common';
import { CreateCheckoutDto, IPaymentMethod } from './dto/create-checkout.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepository } from 'src/common/repository/user/user.repository';
import { CouponRepository } from 'src/common/repository/coupon/coupon.repository';
import { UpdateCheckoutDto } from './dto/update-checkout.dto';
import { StripePayment } from 'src/common/lib/Payment/stripe/StripePayment';
import { CheckoutRepository } from 'src/common/repository/checkout/checkout.repository';

@Injectable()
export class CheckoutService extends PrismaClient {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(user_id: string, createCheckoutDto: CreateCheckoutDto) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const existingUserDetails =
          await UserRepository.getUserDetails(user_id);

        if (!existingUserDetails) {
          return {
            success: false,
            message: 'User not found',
          };
        }
        const data = {};

        // create checkout
        const checkout = await prisma.checkout.create({
          data: {
            ...data,
            user_id: user_id,
          },
        });

        if (!checkout) {
          return {
            success: false,
            message: 'Checkout not created',
          };
        }

        const carts = await prisma.cart.findMany({
          where: {
            user_id: user_id,
          },
          select: {
            id: true,
            product_id: true,
            variant_id: true,
            attribute: true,
            quantity: true,
            product: {
              select: {
                price: true,
              },
            },
          },
        });

        for (const cart of carts) {
          await prisma.checkoutItem.create({
            data: {
              checkout_id: checkout.id,
              product_id: cart.product_id,
              variant_id: cart.variant_id,
              quantity: cart.quantity,
              price: cart.product.price,
              attribute: cart.attribute,
            },
          });
        }

        return {
          success: true,
          message: 'Checkout created successfully.',
          data: checkout,
        };
      });

      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update(
    id: string,
    user_id: string,
    updateCheckoutDto: UpdateCheckoutDto,
  ) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const data: any = {};
        // user details
        // if (updateCheckoutDto.email) {
        //   data.email = updateCheckoutDto.email;
        // } else {
        //   return {
        //     success: false,
        //     message: 'Email is required',
        //   };
        // }
        if (updateCheckoutDto.phone_number) {
          data.phone_number = updateCheckoutDto.phone_number;
        }
        if (updateCheckoutDto.address1) {
          data.address1 = updateCheckoutDto.address1;
        }
        if (updateCheckoutDto.address2) {
          data.address2 = updateCheckoutDto.address2;
        }
        if (updateCheckoutDto.city) {
          data.city = updateCheckoutDto.city;
        }
        if (updateCheckoutDto.state) {
          data.state = updateCheckoutDto.state;
        }
        if (updateCheckoutDto.zip_code) {
          data.zip_code = updateCheckoutDto.zip_code;
        }
        if (updateCheckoutDto.country) {
          data.country = updateCheckoutDto.country;
        }

        const checkoutExists = await prisma.checkout.findUnique({
          where: {
            id: id,
          },
          select: {
            checkout_items: {
              select: {
                product_id: true,
                product: {
                  select: {
                    id: true,
                    user_id: true,
                  },
                },
              },
            },
          },
        });

        if (!checkoutExists) {
          return {
            success: false,
            message: 'Checkout not found',
          };
        }

        // create checkout
        const checkout = await prisma.checkout.update({
          where: {
            id: id,
          },
          data: {
            ...data,
          },
        });

        if (!checkout) {
          return {
            success: false,
            message: 'Checkout not created',
          };
        }

        // create user payment methods
        if (updateCheckoutDto.payment_methods) {
          const payment_method: IPaymentMethod =
            updateCheckoutDto.payment_methods;

          const exp_month = Number(payment_method.expiry_date.split('/')[0]);
          const exp_year = Number(payment_method.expiry_date.split('/')[1]);

          const paymentMethodId = await StripePayment.createPaymentMethod({
            card: {
              number: payment_method.number,
              exp_month: exp_month,
              exp_year: exp_year,
              cvc: payment_method.cvc,
            },
            billing_details: {
              name: payment_method.name,
              // email: updateCheckoutDto.email,
              address: {
                city: updateCheckoutDto.city,
                country: updateCheckoutDto.country,
                line1: updateCheckoutDto.address1,
                line2: updateCheckoutDto.address2,
                postal_code: updateCheckoutDto.zip_code,
                state: updateCheckoutDto.state,
              },
            },
          });

          if (paymentMethodId) {
            const userDetails = await UserRepository.getUserDetails(user_id);

            // attach payment method to stripe customer
            await StripePayment.attachCustomerPaymentMethodId({
              customer_id: userDetails.billing_id,
              payment_method_id: paymentMethodId.id,
            });

            // make it default payment method
            await StripePayment.setCustomerDefaultPaymentMethodId({
              customer_id: userDetails.billing_id,
              payment_method_id: paymentMethodId.id,
            });
          }
        }

        return {
          success: true,
          message: 'Checkout updated successfully.',
        };
      });

      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findOne(id: string) {
    try {
      const checkoutData = await this.prisma.checkout.findUnique({
        where: { id: id },
        select: {
          id: true,
          email: true,
          phone_number: true,
          address1: true,
          address2: true,
          zip_code: true,
          state: true,
          city: true,
          country: true,
          checkout_items: {
            select: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                },
              },
            },
          },
          temp_redeems: {
            select: {
              id: true,
              coupon: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  amount: true,
                  amount_type: true,
                },
              },
            },
          },
        },
      });

      if (!checkoutData) {
        return {
          success: false,
          message: 'Checkout not found',
        };
      }

      // get reviews for the package
      const reviews = await this.prisma.review.findMany({
        where: {
          product_id: checkoutData.checkout_items[0].product.id,
        },
        select: {
          id: true,
          rating_value: true,
          comment: true,
        },
      });

      // calculate avarage rating
      let totalRating = 0;
      let totalReviews = 0;
      for (const review of reviews) {
        totalRating += review.rating_value;
        totalReviews++;
      }
      const averageRating = totalRating / totalReviews;
      checkoutData['average_rating'] = averageRating;

      return {
        success: true,
        data: {
          currency: 'USD',
          checkout: checkoutData,
          fees: 50,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async applyCoupon({
    user_id,
    code,
    // coupons,
    checkout_id,
  }: {
    user_id: string;
    code: string;
    // coupons: ICoupon[];
    checkout_id: string;
  }) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: checkout_id,
        },
        select: {
          id: true,
          checkout_items: {
            select: {
              product_id: true,
            },
          },
        },
      });

      if (!checkout) {
        return {
          success: false,
          message: 'Checkout not found',
        };
      }

      if (!checkout.checkout_items || checkout.checkout_items.length == 0) {
        return {
          success: false,
          message: 'Checkout items not found',
        };
      }

      // apply coupon
      const applyCoupon = await CouponRepository.applyCoupon({
        user_id: user_id,
        coupon_code: code,
        product_id: checkout.checkout_items[0].product_id,
        checkout_id: checkout.id,
      });

      const couponPrice = await CheckoutRepository.calculateCoupon(checkout_id);

      return {
        success: applyCoupon.success,
        message: applyCoupon.message,
        data: couponPrice,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async removeCoupon({
    coupon_id,
    user_id,
    checkout_id,
  }: {
    coupon_id: string;
    user_id: string;
    checkout_id: string;
  }) {
    try {
      const checkout = await this.prisma.checkout.findUnique({
        where: {
          id: checkout_id,
        },
        select: {
          id: true,
          checkout_items: {
            select: {
              product_id: true,
            },
          },
        },
      });

      if (!checkout) {
        return {
          success: false,
          message: 'Checkout not found',
        };
      }

      if (!checkout.checkout_items || checkout.checkout_items.length == 0) {
        return {
          success: false,
          message: 'Checkout items not found',
        };
      }

      // remove coupon
      const removeCoupon = await CouponRepository.removeCouponById({
        coupon_id: coupon_id,
        user_id: user_id,
        checkout_id: checkout.id,
      });

      const couponPrice = await CheckoutRepository.calculateCoupon(checkout_id);

      return {
        success: removeCoupon.success,
        message: removeCoupon.message,
        data: couponPrice,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
