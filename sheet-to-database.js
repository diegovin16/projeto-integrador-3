const { PrismaClient } = require('@prisma/client')
const readXlsxFile = require('read-excel-file/node')

const prisma = new PrismaClient()

const BASE_DATE = new Date('2022-09-12T00:00:00.000Z')
const ONE_DAY_IN_TIME = 86400000
const ONE_HOUR_IN_TIME = 3600000
const ONE_MINUTE_IN_TIME = 60000
const TECHNOLOGIES = [
  'javascript',
  'react',
  'vue',
  'java',
  'c#',
  'python',
  'typescript',
  'rust',
  'aws',
  'oracle',
  'mysql',
  'postgres',
  'postgresql',
  'c++',
  'next',
  'git',
  'github',
  'php',
  'css',
  'html',
  'api',
  'linux',
  'postman',
  'figma',
]

const LIST_REMOTE_WORK_WORDS = ['trabalho remoto']

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

const getTechnologies = (value) => {
  const technologies = []
  if (!value.description) return
  for (const technology of TECHNOLOGIES) {
    if (value.description.toLowerCase().includes(technology)) {
      technologies.push(technology)
    }
  }
  return technologies
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

        let postDate,
          isRemote = false,
          salaryAverage
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
          }),
        }
      }
      values.push({ ...value, technologies: getTechnologies(value) })
    }
  })
  for (const value of values) {
    await prisma.jobOffer.create({
      data: value,
    })
    console.log(`new row inserted = keyword: ${value.keyword}`)
  }
}

main()
