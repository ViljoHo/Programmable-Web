const baseUrl = 'http://localhost:5000/api'

const getAllReports = async () => {
  const response = await fetch("${baseUrl}/reports")

  if (!response.ok) {
    throw new Error('Failed to fetch reports')
  }

  const data = await response.json()
  return data
}

export default { getAllReports }