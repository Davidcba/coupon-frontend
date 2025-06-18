import { useUserInfo } from './useUserInfo'

export const useCompanyId = () => {
  const { companyId } = useUserInfo()
  return companyId
}
