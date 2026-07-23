export type InquiryPayload = {
  name:    string
  email:   string
  phone?:  string
  service: 'fbo' | 'maintenance' | 'charter' | 'catering' | 'vip' | 'leasing' | 'other'
  message: string
}
