Data 12/09/2022
- Foi utilizado a ferramenta Octoparse para coletar dados de vagas de emprego na plataforma Glassdoor
- Palavras chave utilizadas: Engenheiro de software, Analista de sistemas, Desenvolvedor e Programador
- Total de dados coletados 1680, sendo: 
  - Engenheiro de software: 150
  - Programador: 510
  - Analista de sistemas: 510
  - Desenvolvedor: 510

Data 22/09/2022
- Foi criado um script "sheet-to-database.js" para coletar os dados da planilha e subir em um banco de dados Postgres.
- Foi utilizado o Prisma ORM para melhor manipulação do banco de dados com Javascript.
- A modelagem e as migrations estão dentro da pasta /prisma/migrations
- Foi feito a manipulação dos dados para coletar informações como:
    - É vaga de trabalho remoto ou presencial
    - Cálculo da data aproximada de publicação da vaga baseado no valor informado
    - Extração das tecnologias utilizadas com base na descrição da vaga
    - Cálculado um valor médio do salário da vaga, quando é informado uma faixa de valores.