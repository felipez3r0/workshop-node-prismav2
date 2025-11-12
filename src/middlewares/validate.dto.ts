import type express from "express"
import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"

export function validateDto(dtoClass: any) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dtoObject = plainToInstance(dtoClass, req.body)
    const errors = await validate(dtoObject)

    if (errors.length > 0) {
      const messages = errors.map((error) => Object.values(error.constraints || {})).flat()
      return res.status(400).json({ errors: messages })
    }

    req.body = dtoObject
    next()
  }
}
