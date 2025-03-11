export interface UserModel {
  id: number
  player_name: string
  email: string
  password: string
  uuid: string
  player_permlevel: number
  player_permission: number
  faction?: string
  isLeader?: boolean
  secondaryTeam?: string
  money?: number
  is_banned?: number
  teamSpeakUID?: string
  discord_id?: string
  last_login?: Date
  created_at: Date
}