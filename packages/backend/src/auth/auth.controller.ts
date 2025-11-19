import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login (Phase 3)' })
  login(@Body() loginDto: any) {
    return this.authService.login(loginDto)
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration (Phase 3)' })
  register(@Body() registerDto: any) {
    return this.authService.register(registerDto)
  }
}

