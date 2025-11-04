import * as userRepository from "../repositories/user.repository.js"

export async function createUser(data: { name: string; email: string }) {
  return await userRepository.create(data)
}

export async function getAllUsers() {
  return await userRepository.findAll()
}

export async function getUserById(id: number) {
  return await userRepository.findById(id)
}
