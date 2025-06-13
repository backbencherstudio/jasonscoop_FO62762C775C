import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class GetQueryDto{
    @IsOptional()
    @IsIn(['vendor', 'logistics'])
    type?: 'vendor' | 'logistics' = 'vendor';

    @IsOptional()
    @IsString()
    cursor?: string;
    
    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    page?: number = 1;

    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    limit?: number = 10;

    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsIn(['default', 'amount', 'status', 'payment_to'])
    sortBy?: 'default' | 'amount' | 'status' | 'payment_to';
    
    @IsOptional()
    @IsIn(['asc','desc'])    
    order?: 'asc' | 'desc' = 'desc';
    
    @IsOptional()
    @IsString()  
    startDate?: string;
    
    @IsOptional()
    @IsString()   
    endDate?: string;

}

      
      