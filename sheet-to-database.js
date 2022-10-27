const { PrismaClient } = require('@prisma/client')
const readXlsxFile = require('read-excel-file/node')

const prisma = new PrismaClient()

const BASE_DATE = new Date('2022-09-12T00:00:00.000Z')
const ONE_DAY_IN_TIME = 86400000
const ONE_HOUR_IN_TIME = 3600000
const ONE_MINUTE_IN_TIME = 60000

const LIST_REMOTE_WORK_WORDS = ['trabalho remoto']
const normalizeString = (string) =>
  string
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '')
    ?.toUpperCase()
    ?.trim()
const map = {
  0: 'keyword',
  1: 'location',
  3: 'company',
  4: 'rating',
  5: 'title',
  6: 'place',
  7: 'salary',
  8: 'postDate',
  9: 'description',
}

const getTechnologies = (value, TECHNOLOGIES) => {
  const technologies = []
  if (!value.description) return
  for (const technology of TECHNOLOGIES) {
    if (value.description.toLowerCase().includes(technology.name)) {
      technologies.push({
        id: technology.id,
      })
    }
  }
  return {
    connect: technologies,
  }
}

const resolveDate = (date) => {
  let number = '',
    symbol = ''
  for (let i = 0; i < date.length; i++) {
    if (isNumeric(date[i])) {
      number += date[i]
    } else {
      symbol += date[i]
    }
  }

  let resultDate, differenceInTime
  const BASE_DATE_IN_TIME = BASE_DATE.getTime()
  if (symbol === 'd' || symbol === 'd+') {
    differenceInTime = Number(number) * ONE_DAY_IN_TIME
  }
  if (symbol === 'h') {
    differenceInTime = Number(number) * ONE_HOUR_IN_TIME
  }
  resultDate = new Date(BASE_DATE_IN_TIME - differenceInTime)
  return resultDate.toISOString().split('T')[0]
}

function isNumeric(value) {
  return /^-?\d+$/.test(value)
}

const main = async () => {
  const values = []

  const salaryRanges = await prisma.salaryRange.findMany({})
  const technologies = await prisma.technology.findMany({})
  const companies = await prisma.company.findMany({})

  await readXlsxFile('./input/job-offers.xlsx').then((rows) => {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      let value = {}
      for (let j = 0; j < row.length; j++) {
        if (!map[j]) continue
        let column = row[j]
        const isPostDateColumn = map[j] === 'postDate'
        const isPlaceColumn = map[j] === 'place'
        const isSalaryColumn = map[j] === 'salary'
        const isCompanyColumn = map[j] === 'company'

        let postDate,
          isRemote = false,
          salaryAverage,
          companyId,
          salaryRangeId

        if (isPostDateColumn) {
          postDate = column
          const resultDate = resolveDate(column)
          if (resultDate) {
            postDate = resultDate
          }
        }
        if (
          column &&
          isPlaceColumn &&
          LIST_REMOTE_WORK_WORDS.includes(column.toLowerCase())
        ) {
          isRemote = true
        }
        if (isSalaryColumn && column) {
          column = column.toString().replace(' (Employer est.)', '')
          if (column.includes('-')) {
            const values = column.split(' - ')
            const firstValue = values[0].replace('R$', '').replace('K', '')
            const secondValue = values[1].replace('R$', '').replace('K', '')
            const average = (Number(firstValue) + Number(secondValue)) / 2
            salaryAverage = `R$${average}K`

            for (const range of salaryRanges) {
              if (
                average >= Number(range.from) &&
                average <= Number(range.to)
              ) {
                salaryRangeId = range.id
                break
              }
            }
          }
        }
        if (isCompanyColumn && column) {
          column = normalizeString(column)
          const companyFounded = companies.find((c) => c.name === column)
          if (companyFounded) {
            companyId = companyFounded.id
          }
        }
        value = {
          ...value,
          [map[j]]: column,
          ...(isPostDateColumn && {
            postDate,
          }),
          ...(isPlaceColumn && {
            isRemote,
          }),
          ...(isSalaryColumn && {
            salaryAverage,
            salaryRangeId,
          }),
          ...(isCompanyColumn && {
            companyId,
          }),
        }
      }
      values.push({
        ...value,
        technologies: getTechnologies(value, technologies),
      })
    }
  })
  for (const value of values) {
    delete value.company
    await prisma.jobOffer.create({
      data: value,
    })
    console.log(`new row inserted = keyword: ${value.keyword}`)
  }
}

main()
