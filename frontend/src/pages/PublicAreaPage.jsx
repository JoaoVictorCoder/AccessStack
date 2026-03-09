import { useState } from "react";
import {
	createCredenciadoPublic,
	getPublicCredencialPdfUrl,
	getPublicCredencialQr,
} from "../api/credenciamentoApi";
import CredenciadoForm from "../components/CredenciadoForm";
import { baseForm } from "../constants/formConfig";
import {
	formatCellphone,
	formatCnpj,
	formatCpf,
	resolveDistanceFromCidade,
	validatePublicCredenciadoForm,
} from "../utils/validation";

const touchedFieldsOnSubmit = {
	nomeCompleto: true,
	cpf: true,
	cnpj: true,
	celular: true,
	email: true,
	municipio: true,
	uf: true,
	cidadeOrigem: true,
	combustivel: true,
	distanciaKm: true,
	nacionalidade: true,
	nacionalidadeEmpresa: true,
	aceitouLgpd: true,
	aceitouCompartilhamentoComExpositores: true,
	nomeEmpresa: true,
	siteEmpresa: true,
	ccir: true,
	nomePropriedade: true,
	nomeVeiculo: true,
	funcaoCargo: true,
};

function formatFieldValue(name, value, type, checked) {
	if (type === "checkbox") return checked;
	if (name === "cpf") return formatCpf(value);
	if (name === "cnpj") return formatCnpj(value);
	if (name === "celular") return formatCellphone(value);
	return value;
}

export default function PublicAreaPage() {
	const [form, setForm] = useState(baseForm);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [lastCreated, setLastCreated] = useState(null);
	const [qrDataUrl, setQrDataUrl] = useState("");
	const [fieldErrors, setFieldErrors] = useState({});
	const [touched, setTouched] = useState({});

	function onChange(event) {
		const { name, value, type, checked } = event.target;
		const nextValue = formatFieldValue(name, value, type, checked);

		setForm((prev) => {
			const nextForm = {
				...prev,
				[name]: nextValue,
			};

			if (name === "combustivel") {
				nextForm.tipoCombustivel = nextValue;
			}
			if (name === "cidadeOrigem") {
				nextForm.distanciaKm = String(resolveDistanceFromCidade(nextValue));
			}
			if (name === "municipio" && !nextForm.cidadeOrigem) {
				nextForm.distanciaKm = String(resolveDistanceFromCidade(nextValue));
			}

			const { errors } = validatePublicCredenciadoForm(nextForm);
			setFieldErrors((old) => ({
				...old,
				[name]: errors[name],
				documento: errors.documento,
			}));
			return nextForm;
		});
	}

	function onBlur(event) {
		const { name } = event.target;
		setTouched((prev) => ({ ...prev, [name]: true }));
		const { errors } = validatePublicCredenciadoForm(form);
		setFieldErrors(errors);
	}

	async function onSubmit(event) {
		event.preventDefault();
		setError("");
		setSuccess("");
		setSaving(true);

		try {
			const { errors, normalized } = validatePublicCredenciadoForm(form);
			setFieldErrors(errors);
			setTouched(touchedFieldsOnSubmit);

			if (Object.keys(errors).length > 0) {
				throw new Error("Revise os campos destacados antes de enviar");
			}

			const created = await createCredenciadoPublic(normalized);
			setLastCreated(created);
			setSuccess(
				`Cadastro realizado com sucesso. Credencial ${created.credencial?.codigoUnico || "N/A"} gerada.`,
			);

			if (created.credencial?.id) {
				const qr = await getPublicCredencialQr(created.credencial.id);
				setQrDataUrl(qr.qrcode || "");
			}

			setForm((prev) => ({ ...baseForm, categoria: prev.categoria }));
			setFieldErrors({});
			setTouched({});
		} catch (submitError) {
			setError(submitError.message || "Erro ao cadastrar.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<main className="public-layout">
			<section className="public-hero card">
				<div className="hero-top">
					<span className="hero-chip">6a Alta Cafe 2026</span>
					<span className="hero-chip muted">Cultivando conexoes</span>
				</div>
				<h2>Credenciamento Oficial do Evento</h2>
				<p>
					Plataforma institucional para cadastro, emissao de credencial e
					controle de acesso.
				</p>
				<div className="hero-meta">
					<strong>24 a 26 de marco de 2026</strong>
					<span>Clube de Campo da Franca</span>
				</div>
			</section>

			<section className="card card-elevated">
				<h2>Cadastro</h2>
				<p className="section-subtitle">
					Preencha seus dados para o credenciamento no evento.
				</p>
				<CredenciadoForm
					form={form}
					saving={saving}
					errors={fieldErrors}
					touched={touched}
					onChange={onChange}
					onBlur={onBlur}
					onSubmit={onSubmit}
				/>
				{error && <p className="error">{error}</p>}
				{success && <p className="success">{success}</p>}
				{lastCreated?.id && <p>ID do cadastro: {lastCreated.id}</p>}
				<section className="public-credential">
					<h3>Sua credencial</h3>
					{!lastCreated?.credencial?.id && (
						<p className="hint-text">
							A credencial aparece aqui apos o cadastro concluido.
						</p>
					)}
					{lastCreated?.credencial?.id && (
						<div className="details-grid">
							<div className="detail-field">
								<span>Categoria</span>
								<strong>{lastCreated.categoria}</strong>
							</div>
							<div className="detail-field">
								<span>Status credenciamento</span>
								<strong>{lastCreated.statusCredenciamento}</strong>
							</div>
							<div className="detail-field">
								<span>Codigo da credencial</span>
								<strong>{lastCreated.credencial?.codigoUnico || "-"}</strong>
							</div>
							<div className="detail-field">
								<span>PDF da credencial</span>
								<a
									className="link-button"
									target="_blank"
									rel="noreferrer"
									href={getPublicCredencialPdfUrl(lastCreated.credencial.id)}
								>
									Abrir PDF
								</a>
							</div>
						</div>
					)}

					{qrDataUrl && (
						<div className="qr-section">
							<h3>QR Code</h3>
							<img
								src={qrDataUrl}
								alt="QR da credencial"
								className="qr-image"
							/>
						</div>
					)}
				</section>
			</section>
		</main>
	);
}
