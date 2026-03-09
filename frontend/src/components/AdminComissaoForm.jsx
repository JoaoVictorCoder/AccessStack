import { useState } from "react";
import { formFieldLabelKeyByField } from "../constants/formConfig";
import { t } from "../locales";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const initialState = {
  nomeCompleto: "",
  cpf: "",
  cnpj: "",
  celular: "",
  email: "",
  municipio: "",
  uf: "",
  nacionalidade: "Brasil",
  pcd: false,
  funcaoCargo: "",
  aceitouLgpd: true
};

function getFieldLabel(fieldName) {
  return t(formFieldLabelKeyByField[fieldName] || fieldName);
}

export default function AdminComissaoForm({ onCreate, loading, onClose, error }) {
  const [form, setForm] = useState(initialState);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adminForm.addGovernanceTitle")}</DialogTitle>
          <DialogDescription>{t("auth.admin.subtitle")}</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            onCreate(form);
          }}
        >
          {[
            "nomeCompleto",
            "cpf",
            "cnpj",
            "celular",
            "email",
            "municipio",
            "uf",
            "nacionalidade",
            "funcaoCargo"
          ].map((fieldName) => (
            <div key={fieldName} className="field-stack">
              <Label htmlFor={`governance-${fieldName}`}>{getFieldLabel(fieldName)}</Label>
              <Input
                id={`governance-${fieldName}`}
                name={fieldName}
                value={form[fieldName]}
                onChange={handleChange}
                required
                maxLength={fieldName === "uf" ? 2 : undefined}
              />
            </div>
          ))}

          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="pcd"
              checked={form.pcd}
              onChange={handleChange}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            {t("form.pcd")}
          </label>

          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="aceitouLgpd"
              checked={form.aceitouLgpd}
              onChange={handleChange}
              required
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            {t("adminForm.privacyRecord")}
          </label>

          <div className="md:col-span-2 flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("adminForm.close")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("adminForm.saving") : t("adminForm.saveMember")}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
