import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { cores } from '@/constants/cores';
import { cadastrar, mensagemDeErro } from '@/services/auth';
import {
  SENHA_MINIMA,
  validarConfirmacao,
  validarEmail,
  validarNome,
  validarSenha,
} from '@/utils/validacao';

const ESPERA_APOS_SUCESSO_MS = 1200;

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const emailRef = useRef<TextInputInstance>(null);
  const senhaRef = useRef<TextInputInstance>(null);
  const confirmacaoRef = useRef<TextInputInstance>(null);

  // Depois de mostrar a mensagem de sucesso, entra no app (o Firebase já deixa o usuário logado)
  useEffect(() => {
    if (!sucesso) return;
    const timer = setTimeout(() => router.replace('/'), ESPERA_APOS_SUCESSO_MS);
    return () => clearTimeout(timer);
  }, [sucesso]);

  const erros = {
    nome: tentouEnviar ? validarNome(nome) : null,
    email: tentouEnviar ? validarEmail(email) : null,
    senha: tentouEnviar ? validarSenha(senha) : null,
    confirmacao: tentouEnviar ? validarConfirmacao(senha, confirmacao) : null,
  };

  async function handleCadastrar() {
    setTentouEnviar(true);
    setErroGeral(null);
    const invalido =
      validarNome(nome) ||
      validarEmail(email) ||
      validarSenha(senha) ||
      validarConfirmacao(senha, confirmacao);
    if (invalido) return;

    setCarregando(true);
    try {
      await cadastrar(nome, email, senha);
      setSucesso(true);
    } catch (erro) {
      setErroGeral(mensagemDeErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  const bloqueado = carregando || sucesso;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Crie sua conta para publicar e encontrar itens perdidos no campus.
        </Text>

        {erroGeral && (
          <View style={styles.alertaErro} accessibilityRole="alert">
            <Text style={styles.alertaErroTexto}>{erroGeral}</Text>
          </View>
        )}
        {sucesso && (
          <View style={styles.alertaSucesso} accessibilityRole="alert">
            <Text style={styles.alertaSucessoTexto}>Conta criada com sucesso! Entrando...</Text>
          </View>
        )}

        <Input
          label="Nome"
          placeholder="Seu nome completo"
          value={nome}
          onChangeText={setNome}
          erro={erros.nome}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!bloqueado}
        />
        <Input
          ref={emailRef}
          label="E-mail"
          placeholder="nome@iesb.edu.br"
          value={email}
          onChangeText={setEmail}
          erro={erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => senhaRef.current?.focus()}
          editable={!bloqueado}
        />
        <Input
          ref={senhaRef}
          label="Senha"
          placeholder={`Mínimo de ${SENHA_MINIMA} caracteres`}
          value={senha}
          onChangeText={setSenha}
          erro={erros.senha}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmacaoRef.current?.focus()}
          editable={!bloqueado}
        />
        <Input
          ref={confirmacaoRef}
          label="Confirmar senha"
          placeholder="Digite a senha novamente"
          value={confirmacao}
          onChangeText={setConfirmacao}
          erro={erros.confirmacao}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleCadastrar}
          editable={!bloqueado}
        />

        <View style={styles.acoes}>
          <Button
            titulo="Criar conta"
            onPress={handleCadastrar}
            carregando={carregando}
            desabilitado={sucesso}
          />
          <Button
            titulo="Já tenho conta"
            variante="secundario"
            onPress={() => router.back()}
            desabilitado={bloqueado}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  intro: {
    marginBottom: 24,
    fontSize: 15,
    color: cores.textoSuave,
  },
  alertaErro: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: cores.erroFundo,
  },
  alertaErroTexto: {
    color: cores.erro,
    fontSize: 14,
    textAlign: 'center',
  },
  alertaSucesso: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: cores.sucessoFundo,
  },
  alertaSucessoTexto: {
    color: cores.sucesso,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  acoes: {
    marginTop: 8,
    gap: 12,
  },
});
