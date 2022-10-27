const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const readXlsxFile = require('read-excel-file/node')

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

const normalizeString = (string) =>
  string
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '')
    ?.toLowerCase()
    ?.trim()

async function populateCompanies() {
  await readXlsxFile('./input/job-offers.xlsx').then(async (rows) => {
    const companies = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      for (let j = 0; j < row.length; j++) {
        if (!map[j]) continue
        const column = row[j]
        const isCompanyColumn = map[j] === 'company'
        if (
          column &&
          isCompanyColumn &&
          !companies.find((c) => normalizeString(c) === normalizeString(column))
        ) {
          companies.push(normalizeString(column).toUpperCase())
        }
      }
    }
    await prisma.company.createMany({
      data: companies.map((c) => ({
        name: c,
      })),
    })
  })
}

async function main() {
  await prisma.salaryRange.createMany({
    data: [
      {
        from: '1',
        to: '10',
      },
      {
        from: '11',
        to: '20',
      },
      {
        from: '21',
        to: '50',
      },
      {
        from: '51',
        to: '70',
      },
      {
        from: '71',
        to: '90',
      },
      {
        from: '91',
        to: '100',
      },
      {
        from: '101',
        to: '120',
      },
      {
        from: '121',
        to: '140',
      },
      {
        from: '141',
        to: '200',
      },
      {
        from: '200',
        to: '300',
      },
      {
        from: '301',
        to: '500',
      },
    ],
  })
  await prisma.technology.createMany({
    data: TECHNOLOGIES.map((technology) => ({
      name: technology,
    })),
  })
  await populateCompanies()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
