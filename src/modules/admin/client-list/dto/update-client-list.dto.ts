import { PartialType } from '@nestjs/swagger';
import { CreateClientListDto } from './create-client-list.dto';

export class UpdateClientListDto extends PartialType(CreateClientListDto) {}
