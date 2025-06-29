ALTER TABLE operations ENABLE ROW LEVEL SECURITY; ALTER TABLE operation_history ENABLE ROW LEVEL SECURITY; CREATE POLICY \
Técnicos
podem
ver
suas
próprias
operações\ ON operations FOR SELECT TO authenticated USING (technician_id = auth.uid()); CREATE POLICY \Técnicos
podem
criar
operações\ ON operations FOR INSERT TO authenticated WITH CHECK (technician_id = auth.uid()); CREATE POLICY \Técnicos
podem
atualizar
suas
próprias
operações\ ON operations FOR UPDATE TO authenticated USING (technician_id = auth.uid()); CREATE POLICY \Operadores
podem
ver
todas
as
operações\ ON operations FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'operator'); CREATE POLICY \Operadores
podem
atualizar
operações\ ON operations FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'operator'); CREATE POLICY \Técnicos
podem
ver
seu
próprio
histórico\ ON operation_history FOR SELECT TO authenticated USING (technician_id = auth.uid()); CREATE POLICY \Operadores
podem
ver
todo
o
histórico\ ON operation_history FOR SELECT TO authenticated USING (auth.jwt() ->> 'role' = 'operator'); CREATE POLICY \Sistema
pode
inserir
no
histórico\ ON operation_history FOR INSERT TO authenticated WITH CHECK (true);
