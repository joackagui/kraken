import { IsUUID } from "class-validator"


export class CreateProgramOfferingDTO{

    @IsUUID()
    practicaOfferingId: string

    @IsUUID()
    induccionOfferingId: string

}