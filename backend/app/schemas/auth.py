from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Helpful aliases
RegisterRequest = UserRegister
SafeUserResponse = UserResponse
LoginRequest = UserLogin
AccessTokenResponse = TokenResponse
