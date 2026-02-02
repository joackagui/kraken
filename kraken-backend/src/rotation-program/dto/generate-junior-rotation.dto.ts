import { IsBoolean, IsOptional, IsUUID } from "class-validator";


export class GenerateJuniorRotationDto {
    @IsOptional()
    @IsBoolean()
    force?: boolean
}