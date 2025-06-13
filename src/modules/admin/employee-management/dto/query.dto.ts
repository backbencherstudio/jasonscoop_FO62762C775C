import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { number } from "zod";

export class GetQueryDto{
    @IsOptional()
    @IsString()
    q?:string

    @IsOptional()
    @IsString()
    cursor?:string

    @IsOptional()
    @Type(()=> Number)
    @IsNumber()
    page?:number = 1

    @IsOptional()
    @Type(()=> Number)
    @IsNumber()
    limit?: number = 10;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsIn(['default', 'total_no_of_fulfillment', 'no_of_products', 'tickets_resolved','rating'])
    sortBy?: 'default' | 'total_no_of_fulfillment' |'no_of_products'| 'tickets_resolved' | 'rating'
    
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}


