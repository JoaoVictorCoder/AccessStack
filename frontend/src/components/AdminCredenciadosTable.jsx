import { Link } from "react-router-dom";
import { t } from "../locales";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./ui/table";

function getCategoryVariant(category) {
  const key = (category || "").toUpperCase();
  if (key === "EXPOSITOR") return "warning";
  if (key === "COMISSAO_ORGANIZADORA") return "destructive";
  return "secondary";
}

export default function AdminCredenciadosTable({ items, onOpenDetails }) {
  return (
    <div className="rounded-md border bg-card">
      <Table className="min-w-[1050px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.name")}</TableHead>
            <TableHead>{t("table.category")}</TableHead>
            <TableHead>{t("table.email")}</TableHead>
            <TableHead>{t("table.phone")}</TableHead>
            <TableHead>{t("table.cityState")}</TableHead>
            <TableHead>{t("table.privacy")}</TableHead>
            <TableHead>{t("table.taxId")}</TableHead>
            <TableHead>{t("table.companyTaxId")}</TableHead>
            <TableHead>{t("table.credential")}</TableHead>
            <TableHead>{t("table.totalEntries")}</TableHead>
            <TableHead>{t("table.lastEntry")}</TableHead>
            <TableHead>{t("table.registration")}</TableHead>
            <TableHead>{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.nomeCompleto}</TableCell>
              <TableCell>
                <Badge variant={getCategoryVariant(item.categoria)}>{item.categoria}</Badge>
              </TableCell>
              <TableCell>{item.emailMascarado || "-"}</TableCell>
              <TableCell>{item.celularMascarado || "-"}</TableCell>
              <TableCell>
                {item.municipio}/{item.uf}
              </TableCell>
              <TableCell>
                <Badge variant={item.aceitouLgpd ? "success" : "destructive"}>
                  {item.aceitouLgpd ? t("table.accepted") : t("table.denied")}
                </Badge>
              </TableCell>
              <TableCell>{item.cpfMascarado}</TableCell>
              <TableCell>{item.cnpjMascarado || "-"}</TableCell>
              <TableCell>{item.credencial?.codigoUnico || t("common.notAvailable")}</TableCell>
              <TableCell>{item.credencial?.totalEntradas ?? 0}</TableCell>
              <TableCell>
                {item.credencial?.ultimaEntrada
                  ? new Date(item.credencial.ultimaEntrada).toLocaleString()
                  : "-"}
              </TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" type="button" onClick={() => onOpenDetails(item.id)}>
                    {t("table.details")}
                  </Button>
                  {item.credencial?.id && (
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/credenciais/${item.credencial.id}`}>{t("table.credential")}</Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
