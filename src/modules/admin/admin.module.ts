import { Module } from '@nestjs/common';
import { FaqModule } from './faq/faq.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { CountryModule } from './country/country.module';
import { BlogModule } from './blog/blog.module';
import { ContactModule } from './contact/contact.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { WebsiteInfoModule } from './website-info/website-info.module';
import { CouponModule } from './coupon/coupon.module';
import { LanguageModule } from './language/language.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentTransactionModule } from './payment-transaction/payment-transaction.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ManagementModule } from './employee-management/employee-management.module';
import { LogisticsVerificationModule } from './logistics-verification/logistics-verification.module';
import { PayrollModule } from './payroll/payroll.module';
import { ReturnProductModule } from './return-product/return-product.module';
import { ReportModule } from './report/report.module';
import { VideoModule } from './video/video.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    FaqModule,
    CategoryModule,
    TagModule,
    CountryModule,
    BlogModule,
    ContactModule,
    SocialMediaModule,
    WebsiteInfoModule,
    CouponModule,
    LanguageModule,
    ReviewsModule,
    PaymentTransactionModule,
    UserModule,
    NotificationModule,
    DashboardModule,
    ManagementModule,
    LogisticsVerificationModule,
    PayrollModule,
    ReturnProductModule,
    ReportModule,
    VideoModule,
    AnalyticsModule,
  ],
})
export class AdminModule {}
