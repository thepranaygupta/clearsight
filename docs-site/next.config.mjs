import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/',
})

export default withNextra({
  turbopack: {
    root: process.cwd(),
  },
})
