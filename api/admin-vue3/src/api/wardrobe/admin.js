import request from '@/utils/request'

export function getOverview() {
  return request({ url: '/wardrobe/admin/overview', method: 'get' })
}

export function listResource(resource, query) {
  return request({ url: `/wardrobe/admin/${resource}`, method: 'get', params: query })
}

export function createChallenge(data) {
  return request({ url: '/wardrobe/admin/challenges', method: 'post', data })
}

export function updateChallenge(data) {
  return request({ url: '/wardrobe/admin/challenges', method: 'put', data })
}

export function updateResource(resource, id, data) {
  return request({ url: `/wardrobe/admin/${resource}/${id}`, method: 'put', data })
}

export function removeResource(resource, id) {
  return request({ url: `/wardrobe/admin/${resource}/${id}`, method: 'delete' })
}

export function updateMembership(userId, data) {
  return request({ url: `/wardrobe/admin/users/${userId}/membership`, method: 'put', data })
}
