import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProcessService } from "./process.service";

@ApiTags('Process')
@Controller('process')
export class ProcessController {
  constructor(private processService: ProcessService) {}
  
}