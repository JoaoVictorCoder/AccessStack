import { useMemo, useState } from "react";
import { t } from "../locales";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./ui/table";

function createDefaultOperatorPermissions() {
  return {
    podeValidarEntrada: true,
    podeVisualizarDadosMinimosCredenciado: true,
    podeVerHistoricoBasicoDaCredencial: true,
    podeRegistrarObservacaoOperacional: true,
    podeConsultarUltimasEntradas: true,
    podeUsarCameraParaLeituraQR: true
  };
}

function createEmptyForm() {
  return {
    nome: "",
    email: "",
    senha: "",
    role: "OPERADOR_QR",
    standId: "",
    standName: "",
    empresaNome: "",
    empresaVinculadaId: "",
    empresaVinculadaNome: "",
    comissaoResponsavelId: ""
  };
}

export default function InternalUsersPanel({
  managerRole,
  users,
  currentUserId,
  onCreate,
  onToggleActive,
  onUpdatePermissions,
  onUpdateUser
}) {
  const [form, setForm] = useState(createEmptyForm);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [draftPermissions, setDraftPermissions] = useState(createDefaultOperatorPermissions());
  const [draftUser, setDraftUser] = useState({
    standId: "",
    standName: "",
    empresaNome: "",
    empresaVinculadaId: "",
    empresaVinculadaNome: "",
    comissaoResponsavelId: ""
  });

  const usersById = useMemo(
    () => Object.fromEntries((users || []).map((user) => [user.id, user])),
    [users]
  );
  const visibleUsers = useMemo(
    () => (users || []).filter((user) => user.id !== currentUserId),
    [users, currentUserId]
  );

  async function handleCreate(event) {
    event.preventDefault();
    setIsCreating(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await onCreate({
        ...form,
        permissoesCustomizadas: form.role === "OPERADOR_QR" ? createDefaultOperatorPermissions() : null
      });
      setForm(createEmptyForm());
      setSuccessMessage(t("usersPanel.createSuccess"));
    } catch (createError) {
      setErrorMessage(createError.message || t("usersPanel.createError"));
    } finally {
      setIsCreating(false);
    }
  }

  function beginEdit(user) {
    setEditingUserId(user.id);
    setDraftPermissions({
      ...createDefaultOperatorPermissions(),
      ...(user.permissoesCustomizadas || {})
    });
    setDraftUser({
      standId: user.standId || "",
      standName: user.standName || "",
      empresaNome: user.empresaNome || "",
      empresaVinculadaId: user.empresaVinculadaId || "",
      empresaVinculadaNome: user.empresaVinculadaNome || "",
      comissaoResponsavelId: user.comissaoResponsavelId || ""
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function saveEdit(user) {
    setLoadingRowId(user.id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (user.role === "OPERADOR_QR") {
        await onUpdatePermissions(user.id, draftPermissions);
      }

      await onUpdateUser(user.id, {
        standId: draftUser.standId,
        standName: draftUser.standName,
        empresaNome: draftUser.empresaNome,
        empresaVinculadaId: draftUser.empresaVinculadaId,
        empresaVinculadaNome: draftUser.empresaVinculadaNome,
        comissaoResponsavelId: draftUser.comissaoResponsavelId
      });

      setEditingUserId("");
      setSuccessMessage(t("usersPanel.saveSuccess"));
    } catch (saveError) {
      setErrorMessage(saveError.message || t("usersPanel.saveError"));
    } finally {
      setLoadingRowId("");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("usersPanel.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleCreate}>
          <div className="field-stack">
            <Label>{t("usersPanel.name")}</Label>
            <Input
              value={form.nome}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, nome: event.target.value }))
              }
              required
            />
          </div>
          <div className="field-stack">
            <Label>{t("table.email")}</Label>
            <Input
              value={form.email}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, email: event.target.value }))
              }
              required
            />
          </div>
          <div className="field-stack">
            <Label>{t("auth.password")}</Label>
            <Input
              type="password"
              value={form.senha}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, senha: event.target.value }))
              }
              required
            />
          </div>
          <div className="field-stack">
            <Label>{t("usersPanel.role")}</Label>
            {managerRole === "COMISSAO_ORGANIZADORA" ? (
              <Input value="OPERADOR_QR" disabled />
            ) : (
              <Select
                value={form.role}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, role: event.target.value }))
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="COMISSAO_ORGANIZADORA">COMISSAO_ORGANIZADORA</option>
                <option value="OPERADOR_QR">OPERADOR_QR</option>
              </Select>
            )}
          </div>
          <div className="field-stack">
            <Label>{t("usersPanel.standId")}</Label>
            <Input
              value={form.standId}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, standId: event.target.value }))
              }
            />
          </div>
          <div className="field-stack">
            <Label>{t("usersPanel.standName")}</Label>
            <Input
              value={form.standName}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, standName: event.target.value }))
              }
            />
          </div>
          <div className="field-stack">
            <Label>{t("usersPanel.company")}</Label>
            <Input
              value={form.empresaVinculadaNome || form.empresaNome}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  empresaNome: event.target.value,
                  empresaVinculadaNome: event.target.value
                }))
              }
            />
          </div>
          <div className="field-stack">
            <Label>{t("usersPanel.companyId")}</Label>
            <Input
              value={form.empresaVinculadaId}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, empresaVinculadaId: event.target.value }))
              }
            />
          </div>
          {managerRole !== "COMISSAO_ORGANIZADORA" && (
            <div className="field-stack">
              <Label>{t("usersPanel.governanceResponsibleId")}</Label>
              <Input
                value={form.comissaoResponsavelId}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    comissaoResponsavelId: event.target.value
                  }))
                }
              />
            </div>
          )}
          <div className="md:col-span-2 xl:col-span-3">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t("usersPanel.creating") : t("usersPanel.createUser")}
            </Button>
          </div>
        </form>

        {successMessage && (
          <Alert variant="success">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("usersPanel.name")}</TableHead>
                <TableHead>{t("table.email")}</TableHead>
                <TableHead>{t("usersPanel.role")}</TableHead>
                <TableHead>{t("usersPanel.standName")}</TableHead>
                <TableHead>{t("usersPanel.company")}</TableHead>
                <TableHead>{t("usersPanel.active")}</TableHead>
                <TableHead>{t("usersPanel.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.map((user) => {
                const isEditing = editingUserId === user.id;
                const isRowLoading = loadingRowId === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={draftUser.standName}
                          onChange={(event) =>
                            setDraftUser((currentDraft) => ({
                              ...currentDraft,
                              standName: event.target.value
                            }))
                          }
                        />
                      ) : (
                        user.standName || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={draftUser.empresaVinculadaNome || draftUser.empresaNome}
                          onChange={(event) =>
                            setDraftUser((currentDraft) => ({
                              ...currentDraft,
                              empresaNome: event.target.value,
                              empresaVinculadaNome: event.target.value
                            }))
                          }
                        />
                      ) : (
                        user.empresaVinculadaNome || user.empresaNome || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.ativo ? "success" : "destructive"}>
                        {user.ativo ? t("common.yes") : t("common.no")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isRowLoading}
                          onClick={async () => {
                            setLoadingRowId(user.id);
                            setErrorMessage("");
                            setSuccessMessage("");
                            try {
                              await onToggleActive(user.id, !user.ativo);
                              setSuccessMessage(t("usersPanel.statusSuccess"));
                            } catch (toggleError) {
                              setErrorMessage(toggleError.message || t("usersPanel.statusError"));
                            } finally {
                              setLoadingRowId("");
                            }
                          }}
                        >
                          {isRowLoading
                            ? t("usersPanel.editing")
                            : user.ativo
                              ? t("usersPanel.deactivate")
                              : t("usersPanel.activate")}
                        </Button>

                        {!isEditing && (
                          <Button type="button" size="sm" variant="secondary" onClick={() => beginEdit(user)}>
                            {t("usersPanel.editUser")}
                          </Button>
                        )}

                        {isEditing && (
                          <>
                            {user.role === "OPERADOR_QR" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setDraftPermissions((currentPermissions) => ({
                                    ...currentPermissions,
                                    podeUsarCameraParaLeituraQR:
                                      !currentPermissions.podeUsarCameraParaLeituraQR
                                  }))
                                }
                              >
                                {t("usersPanel.cameraPermission", {
                                  value: draftPermissions.podeUsarCameraParaLeituraQR ? "ON" : "OFF"
                                })}
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              disabled={isRowLoading}
                              onClick={() => saveEdit(user)}
                            >
                              {isRowLoading ? t("credentialPage.saving") : t("usersPanel.saveChanges")}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingUserId("");
                                setDraftPermissions(createDefaultOperatorPermissions());
                              }}
                            >
                              {t("common.cancel")}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {editingUserId && usersById[editingUserId]?.role === "OPERADOR_QR" && (
          <Card className="border-zinc-200 bg-zinc-50">
            <CardHeader>
              <CardTitle className="text-base">{t("usersPanel.operatorPermissions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(draftPermissions).map(([permissionKey, value]) => (
                  <label key={permissionKey} className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm">
                    <input
                      type="checkbox"
                      checked={value === true}
                      onChange={(event) =>
                        setDraftPermissions((currentPermissions) => ({
                          ...currentPermissions,
                          [permissionKey]: event.target.checked
                        }))
                      }
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    {permissionKey}
                  </label>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="field-stack">
                  <Label>{t("usersPanel.standId")}</Label>
                  <Input
                    value={draftUser.standId}
                    onChange={(event) =>
                      setDraftUser((currentDraft) => ({
                        ...currentDraft,
                        standId: event.target.value
                      }))
                    }
                  />
                </div>
                <div className="field-stack">
                  <Label>{t("usersPanel.companyId")}</Label>
                  <Input
                    value={draftUser.empresaVinculadaId}
                    onChange={(event) =>
                      setDraftUser((currentDraft) => ({
                        ...currentDraft,
                        empresaVinculadaId: event.target.value
                      }))
                    }
                  />
                </div>
                {managerRole !== "COMISSAO_ORGANIZADORA" && (
                  <div className="field-stack">
                    <Label>{t("usersPanel.governanceResponsibleId")}</Label>
                    <Input
                      value={draftUser.comissaoResponsavelId}
                      onChange={(event) =>
                        setDraftUser((currentDraft) => ({
                          ...currentDraft,
                          comissaoResponsavelId: event.target.value
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
