export const credenciadoIdentityInclude = {
  evento: true,
  credencial: {
    include: {
      _count: {
        select: { accessAttempts: true }
      },
      accessAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  }
};

export const credencialWithCredenciadoInclude = {
  credenciado: {
    include: {
      evento: true
    }
  }
};

export const eventoSistemaCredenciadoSelect = {
  credenciado: {
    select: {
      id: true,
      nomeCompleto: true,
      categoria: true,
      statusCredenciamento: true
    }
  }
};
