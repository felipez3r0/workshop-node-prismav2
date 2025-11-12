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

export async function updateUser(id: number, data: { name?: string; email?: string }) {
  const user = await userRepository.findById(id)
  if (!user) {
    return null
  }
  return await userRepository.update(id, data)
}

export async function deleteUser(id: number) {
  const user = await userRepository.findById(id)
  if (!user) {
    return null
  }
  return await userRepository.remove(id)
}
